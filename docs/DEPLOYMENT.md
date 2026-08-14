# Taking SIWS live on a Hostinger VPS (KVM 2)

Written for Hostinger **KVM 2** — 2 vCPU, 8 GB RAM, 100 GB NVMe — running
**Ubuntu 24.04**. That size is chosen, not guessed: the Next.js production build
peaks at about **1.2 GB RSS**, which KVM 1 (4 GB, shared with Postgres) can hit
the ceiling on. Everything below also works on a larger plan unchanged.

Roughly 45–60 minutes end to end.

---

## Two things that will bite you if you skip them

**1. The site's content lives in PostgreSQL, not in the repository.**
The code in git renders pages; the pages themselves — 106 of them — plus 346
media records, 66 faculty records and the four unit sites are rows in the
database. A fresh empty database gives you a working application with **no
website in it**. Step 6 carries the data across.

**2. There are no migrations in this project yet.**
`payload.config.ts` sets `push: process.env.NODE_ENV !== 'production'`, so
Payload builds the schema automatically in development and deliberately does
**not** in production. With no `src/migrations/` directory, a production start
against an empty database will not create tables. The database dump in step 6
carries the schema as well as the content, which resolves this for the first
deploy. See *Schema changes after go-live* at the end for the ongoing story.

---

## 1. Point the domain at the server

In your DNS provider (Hostinger's own panel, or wherever `siwsschool.edu.in` is
managed):

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | your VPS IPv4 |
| A | `www` | your VPS IPv4 |

Do this first — DNS takes time to propagate, and the TLS certificate in step 8
cannot be issued until it has. Check with `dig +short siwsschool.edu.in`.

---

## 2. Prepare the server

SSH in as root, then create a non-root user to run the app. Nothing below runs
the site as root.

```bash
adduser --disabled-password --gecos "" siws
usermod -aG sudo siws
rsync --archive --chown=siws:siws ~/.ssh /home/siws/

apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib ufw

# Node 22 LTS (package.json requires >= 20.9)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v      # expect v22.x

npm install -g pm2
```

Firewall — SSH and web only. Postgres stays on localhost and is never exposed:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 3. Create the database

```bash
sudo -u postgres psql
```

```sql
CREATE ROLE siws WITH LOGIN PASSWORD 'use-a-long-random-password';
CREATE DATABASE siws OWNER siws;
\q
```

Confirm it accepts that login before going further:

```bash
psql "postgres://siws:use-a-long-random-password@localhost:5432/siws" -c '\conninfo'
```

---

## 4. Get the code

```bash
su - siws
git clone https://github.com/tech976/SIWS.git app
cd app
```

The clone is around **600 MB** — `media/` is committed, so all 3,942 photograph
files and their derivatives come with it. That is deliberate: a clone renders
every picture without a separate asset sync.

---

## 5. Configure the environment

```bash
cp .env.example .env
nano .env
```

Fill in every value. Generate the two secrets with `openssl rand -base64 48`.

Set `NEXT_PUBLIC_SERVER_URL=https://siwsschool.edu.in` **now**, before any
content is saved — Payload writes media URLs into the database using it, and a
wrong value gets baked into stored rows.

Leave `NEXT_PUBLIC_ENABLE_INDEXING=false` until the launch checklist in step 9.

---

## 6. Carry the database across

**On your machine**, dump the development database (about 25 MB, compresses
small):

```bash
pg_dump --no-owner --no-privileges --clean --if-exists \
  "postgres://USER@localhost:5432/YOUR_DEV_DB" > siws.sql
gzip siws.sql
scp siws.sql.gz siws@YOUR_SERVER_IP:~/
```

**On the server**:

```bash
gunzip ~/siws.sql.gz
psql "postgres://siws:PASSWORD@localhost:5432/siws" < ~/siws.sql
rm ~/siws.sql
```

Verify the content actually arrived — this is the step people skip and then
wonder why the site is empty:

```bash
psql "postgres://siws:PASSWORD@localhost:5432/siws" \
  -c "SELECT (SELECT count(*) FROM pages) AS pages,
             (SELECT count(*) FROM media) AS media,
             (SELECT count(*) FROM faculty) AS faculty,
             (SELECT count(*) FROM users) AS users;"
```

Expect roughly `106 | 346 | 66 | 1`. If `users` is 0 you will not be able to log
in to `/admin`; create one with `npx tsx src/scripts/temp-admin.ts` and change
the password immediately after first login.

---

## 7. Build and run

```bash
cd ~/app
npm ci
npm run build
```

If the build is killed on a smaller plan, add swap and retry:

```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

The app listens on **3001** (`npm start`). Start it under pm2 so it survives
crashes and reboots:

```bash
pm2 start npm --name siws -- start
pm2 save
pm2 startup systemd -u siws --hp /home/siws   # run the command it prints, as root
```

Check it: `curl -I http://127.0.0.1:3001` should return `200`.

---

## 8. Nginx and TLS

```bash
sudo nano /etc/nginx/sites-available/siws
```

```nginx
server {
    listen 80;
    server_name siwsschool.edu.in www.siwsschool.edu.in;

    # Payload accepts uploads up to 12 MB; the default 1 MB would reject
    # photographs from the admin panel with a confusing 413.
    client_max_body_size 12M;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/siws /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d siwsschool.edu.in -d www.siwsschool.edu.in
```

Certbot rewrites the server block for HTTPS and installs a renewal timer.
Confirm renewal works: `sudo certbot renew --dry-run`.

---

## 9. Go-live checklist

Work through these in order. The first one is a requirement, not a nicety.

- [ ] **Turn on indexing.** Set `NEXT_PUBLIC_ENABLE_INDEXING=true` in `.env`,
      then `npm run build && pm2 restart siws`. Until you do, every page serves
      `noindex` and Google will ignore the site entirely. This is BR-SEO-08:
      indexing is opt-in so staging can never leak into search results.
- [ ] Log in at `https://siwsschool.edu.in/admin` and change the admin password.
- [ ] Visit `/`, `/kindergarten`, `/primary`, `/secondary`, `/junior-college`
      and confirm photographs load.
- [ ] Submit the enquiry form once and confirm the row appears under Enquiries
      in the admin panel.
- [ ] Check the accessibility controls in the footer (text size, high contrast).
- [ ] Confirm `https://siwsschool.edu.in/robots.txt` and `/sitemap.xml` respond.

---

## Backups

The database is the site. Back it up nightly, off the server.

```bash
sudo -u siws mkdir -p /home/siws/backups
sudo -u siws crontab -e
```

```cron
15 2 * * * pg_dump --no-owner --no-privileges "postgres://siws:PASSWORD@localhost:5432/siws" | gzip > /home/siws/backups/siws-$(date +\%F).sql.gz
30 2 * * * find /home/siws/backups -name '*.sql.gz' -mtime +14 -delete
```

`media/` also needs backing up once editors start uploading through the admin
panel — those files are written to disk and are **not** in git. Either
`rsync` the directory off-server on the same schedule, or move uploads to S3
(the Payload S3 adapter is a drop-in change to `payload.config.ts`).

---

## Deploying an update

```bash
su - siws && cd ~/app
git pull
npm ci
npm run build
pm2 restart siws
```

Roughly 60–90 seconds of degraded response while it rebuilds. For zero
downtime, build into a fresh directory and switch a symlink, or run two pm2
instances behind nginx.

---

## Schema changes after go-live

Development pushes schema automatically; production does not. Once the site is
live, any change to a collection or block **must** ship as a migration:

```bash
# locally, after changing a collection or block
npx payload migrate:create describe-the-change
git add src/migrations && git commit && git push

# on the server, as part of the deploy, BEFORE pm2 restart
npm run migrate
```

Without this, a new field exists in the code and not in the database, and the
page that uses it fails at runtime. Generate the first migration before the
next schema change rather than in the middle of an incident.

---

## Sizing notes

| | |
| --- | --- |
| Build peak memory | ~1.2 GB |
| Repository on disk | ~600 MB (includes `media/`) |
| Database | ~25 MB |
| Idle app memory | ~150–250 MB |

KVM 2's 8 GB leaves comfortable headroom for Postgres, nginx and the build
running together. KVM 1 (4 GB) can serve the site but is tight during a build —
if you use it, add the swap file from step 7 and expect slower deploys.

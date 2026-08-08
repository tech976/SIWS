import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')
const { richText } = await import('./lexical')

/**
 * Seeds the Primary section (Wadala campus) from the information requirement
 * document SIWS returned.
 *
 * Everything published here is SIWS's own wording. Where the document left a
 * heading blank — fee details, photographs, testimonials, alumni achievements,
 * press mentions, awards, social media handles and the legal documents — no
 * page or section is invented to fill the gap; the omission is reported at the
 * end of the run instead.
 *
 * Run with:  npm run seed:primary
 */

/**
 * CORRECTION: the Primary section covers GRADES 1 TO 4.
 *
 * An earlier seed guessed "Standards I to VII" from the usual Maharashtra
 * pattern and flagged it as unconfirmed. SIWS's document settles it, and the
 * enquiry form's class list is corrected here to match — an enquiry offering
 * classes the school does not run is worse than offering none.
 */
const CLASS_OPTIONS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4']

const SUBJECTS = [
  { title: 'English' },
  { title: 'Marathi' },
  { title: 'Mathematics' },
  { title: 'EVS', description: 'Includes Science, History, Geography and Civics.' },
  { title: 'Art' },
  { title: 'Work Experience' },
  { title: 'Physical Education' },
]

const GRADE_CURRICULUM = [
  {
    title: 'Grade 1 — Building Strong Foundations',
    description:
      'The focus is on developing literacy, numeracy and communication skills through stories, songs, games, rhymes, hands-on activities and play-based learning. Children are encouraged to observe, explore, ask questions and express themselves confidently in a joyful learning environment.',
  },
  {
    title: 'Grade 2 — Strengthening Concepts',
    description:
      'Students strengthen their reading, writing and mathematical skills while developing curiosity, creativity and independent thinking. Learning experiences are connected to real-life situations through activities, projects and collaborative tasks.',
  },
  {
    title: 'Grade 3 — Expanding Knowledge',
    description:
      'The curriculum encourages deeper conceptual understanding across languages, Mathematics and Environmental Studies. Students participate in experiments, discussions, projects and creative assignments that promote analytical thinking, communication and problem-solving skills.',
  },
  {
    title: 'Grade 4 — Preparing for Higher Learning',
    description:
      'Students are guided towards independent learning by strengthening conceptual understanding, critical thinking and application-based learning. They develop confidence through presentations, teamwork, research-based activities and experiential learning, preparing them for the next stage of schooling.',
  },
]

const TEACHING_PRACTICES = [
  { title: 'Activity-based and experiential learning' },
  { title: 'Competency-based teaching with focus on learning outcomes' },
  { title: 'Storytelling, role play, music and art-integrated learning' },
  { title: 'Project-based and collaborative learning' },
  { title: 'Smart Classroom and digital learning resources' },
  { title: 'Inquiry-based learning that encourages questioning and exploration' },
  { title: 'Real-life applications to make learning meaningful' },
  { title: 'Continuous formative assessment and constructive feedback' },
  { title: 'Individual attention and remedial support wherever required' },
  { title: 'Value education, environmental awareness and life-skill development' },
]

const HOLISTIC = [
  { title: 'Literary and language activities' },
  { title: 'Mathematics and EVS enrichment programmes' },
  { title: 'Art, Craft, Music and Dance' },
  { title: 'Sports and Physical Education' },
  { title: 'Cultural celebrations and festivals' },
  { title: 'Environmental awareness initiatives' },
  { title: 'Leadership opportunities and value-based activities' },
]

const PROGRAMME_BENEFITS = [
  { title: 'Strong academic foundation' },
  { title: 'Interactive and technology-enabled learning' },
  { title: 'Safe and secure campus with CCTV surveillance' },
  { title: 'Development of communication, creativity and critical thinking' },
  { title: 'Sports, arts and cultural exposure' },
  { title: 'Value education and life skills' },
  { title: 'Seamless progression to higher classes within the SIWS Group of Institutions' },
]

const USPS = [
  {
    title: 'Academic Excellence',
    description:
      'A strong academic foundation based on the Maharashtra State Board curriculum, supported by innovative teaching methods, continuous assessment and individual attention to every child.',
  },
  {
    title: 'Experienced & Dedicated Faculty',
    description:
      'Our qualified and experienced teachers use child-centred, activity-based and competency-driven teaching strategies to make learning meaningful and enjoyable.',
  },
  {
    title: 'Smart Classrooms',
    description:
      'Technology-enabled classrooms with interactive smart panels enhance teaching and learning through multimedia content, interactive lessons and digital resources.',
  },
  {
    title: 'Holistic Development',
    description:
      'Students are encouraged to participate in sports, cultural activities, art, music, dance, competitions, leadership programmes and value-based initiatives, ensuring all-round personality development.',
  },
  {
    title: 'Individual Care & Inclusive Education',
    description:
      'We recognise that every child is unique. Personal attention, remedial support and encouragement help each learner achieve their fullest potential.',
  },
  {
    title: 'Values & Character Building',
    description:
      'Along with academic learning, we instil values such as honesty, empathy, responsibility, respect, teamwork and environmental consciousness.',
  },
  {
    title: 'Strong School–Parent Partnership',
    description:
      'Regular communication, parent interactions and collaborative initiatives ensure that parents remain active partners in their child’s educational journey.',
  },
  {
    title: 'Seamless Academic Progression',
    description:
      'As part of the SIWS Group of Institutions, students benefit from a smooth transition from the Primary Section to higher classes within the institution.',
  },
  {
    title: 'Co-curricular & Experiential Learning',
    description:
      'Field visits, celebrations, projects, language enrichment programmes and hands-on experiences make learning practical, enjoyable and relevant.',
  },
  {
    title: 'Focus on Future-Ready Skills',
    description:
      'We nurture creativity, communication, collaboration, critical thinking, problem-solving and digital literacy, preparing students to thrive in an ever-changing world.',
  },
]

const COMPETITIONS = [
  'Recitation',
  'Fancy Dress',
  'Elocution',
  'Drawing & Painting',
  'Story Telling',
  'Group Singing (Patriotic Songs)',
  'Handwriting',
  'Work Experience',
  'Clay Work',
  'Rangoli',
  'Best out of Waste',
  'Sports & Games',
].map((title) => ({ title }))

/**
 * MATUNGA CAMPUS
 * ==============
 * From SIWS's second requirement document. The two campuses share a board, a
 * grade range and an admissions policy, so only what actually differs is
 * recorded separately: the roster, the house rules, and the way each campus
 * describes itself.
 *
 * The Matunga document is headed "Kindergarten to Standard X" — that is the
 * blank form's own title, sent to every section. Its content describes Grades 1
 * to 4 ("a seamless educational pathway from standard I to standard IV"), and
 * it answers "Progression pathway to Junior College / Degree College" with
 * "Not applicable". So nothing here claims a Matunga Secondary section, and the
 * progression benefit that Wadala's document does claim is left off Matunga.
 */
const MATUNGA_FACULTY = [
  {
    name: 'Mrs. Sreedevi Prasanna Bagayatkar',
    designation: 'Head Teacher',
    qualifications: 'S.S.C., D.Ed.',
  },
  { name: 'Mrs. Vinaya Haridas Kamath', qualifications: 'S.S.C., D.Ed.' },
  { name: 'Mrs. Malathi Premnath Shankar', qualifications: 'S.S.C., D.Ed.' },
  { name: 'Mrs. Parameshwari Perumal Raj', qualifications: 'B.A., D.Ed.' },
  { name: 'Mrs. Thangamani Belvintony', qualifications: 'B.A., D.Ed.' },
  { name: 'Mrs. Usha Raju', qualifications: 'B.A., D.Ed.' },
  { name: 'Ms. Payal Sandeep Shukla', qualifications: 'H.S.C., D.Ed.' },
  { name: 'Mrs. Mary Dolours Richard', qualifications: 'B.A., D.Ed.' },
  { name: 'Ms. Prema Keshwan Devendra', qualifications: 'B.A., D.Ed.' },
]

/** The 18 rules Matunga supplied, verbatim. */
const MATUNGA_RULES: string[] = [
  'Bring the school calendar every day.',
  'Maintain at least 80% attendance.',
  'Wear proper school uniform.',
  'Take care of your books and belongings; don’t wear ornaments.',
  'Maintain discipline in school and during activities.',
  'Speak only in English in school.',
  'Avoid late coming, absenteeism, and indiscipline.',
  'Do not damage school property; compensation must be paid if damaged.',
  'Parents should meet teachers only with prior permission.',
  'Inform the school of any change in address or phone number.',
  'Do not give cash or gifts to teachers.',
  'Do not bring unnecessary books, magazines, or newspapers. Bring only dry snacks.',
  'Do not participate in political or communal activities.',
  'Parents should ensure regularity, homework, and discipline.',
  'Be regular, obedient and polite.',
  'No school office work on Saturdays, Sundays, or holidays.',
  'Certificates are issued only during the specified office hours.',
  'Follow the Library Rules.',
]

/**
 * Matunga's subject list, as written. It differs from Wadala's only in wording
 * — "Environmental Studies Part 1 and 2" where Wadala wrote "EVS", and
 * "Physical Training" where Wadala wrote "Physical Education" — so the two are
 * kept distinct rather than silently harmonised.
 */
const MATUNGA_SUBJECTS = [
  { title: 'English' },
  { title: 'Mathematics' },
  { title: 'Marathi' },
  { title: 'Environmental Studies', description: 'Part 1 and Part 2.' },
  { title: 'Art' },
  { title: 'Work Experience' },
  { title: 'Physical Training' },
]

const MATUNGA_BENEFITS = [
  { title: 'Strong academic foundation' },
  { title: 'Value-based education' },
  { title: 'Co-curricular activities' },
  { title: 'Sports' },
  { title: 'Holistic development' },
]

/** Head teacher first; the rest in the order SIWS listed them. */
const FACULTY = [
  {
    name: 'Mrs. Geeta Raja',
    designation: 'I/C Head Teacher',
    qualifications: 'B.A., D.Ed., DSM (Diploma in School Management)',
  },
  { name: 'Jayasudha Christopher', qualifications: 'B.A., D.Ed.' },
  { name: 'Vailankani Antony Vincent Pinto', qualifications: 'B.A., D.Ed.' },
  { name: 'Padma Thippaya Baikadi', qualifications: 'B.A., D.Ed.' },
  { name: 'Sobika Rangaswamy', qualifications: 'M.A., D.Ed.' },
  { name: 'Nadar Alagumathi Selvaganeshan', qualifications: 'B.A., D.Ed.' },
  { name: 'Nadar Arulpoornam Jegan', qualifications: 'B.A., D.Ed.' },
  { name: 'Awari Vanita Subhash', qualifications: 'B.A., D.Ed.' },
  { name: 'Shravani Ramesh', qualifications: 'B.Com., D.Ed.' },
  { name: 'Poornima Kaur Sandhu', qualifications: 'H.S.C., D.Ed.' },
  { name: 'Gurjit Kaur Matta', qualifications: 'B.A., D.Ed.' },
  { name: 'Shruti Sampat Gaware', qualifications: 'B.A., D.Ed.' },
  { name: 'Deepika Naidu', qualifications: 'H.S.C., D.Ed.' },
]

/** The 19 general rules, verbatim. */
const GENERAL_RULES: string[] = [
  'Every pupil must possess a copy of the school calendar which must be brought daily to the school.',
  'Pupils suffering from contagious diseases or declared infectious diseases by the health authorities, and which require segregation in the class, will not be permitted to attend school without the pupil being certified as fit by the doctor.',
  'All pupils must come to school in the prescribed uniform. They should always be neat and tidy.',
  'Pupils are responsible for the safe custody of their books and other belongings. They are requested not to wear any ornaments or watch for the sake of personal safety.',
  'Irregular attendance, habitual idleness, late coming, wilful disobedience or conduct and any form of indiscipline in the school will be seriously dealt with. All pupils are responsible to the school authorities for their behaviour inside the school.',
  'All students must possess the school identity card which they must carry daily to school. Similarly, they must bring to school their School Diary without fail.',
  'Any damage to school property, whether inside or outside the classrooms or within the school premises, will have to be made good by those responsible for it or by their parents or guardians. The decision of the school authorities regarding compensation payable to the school is final.',
  'Parents/guardians or others are not allowed to see their wards or meet their teacher during school hours without the prior consent of the Head Teacher.',
  'Any breach of discipline or disrespect to any member of the school staff will be dealt with seriously and pupils responsible for such misbehaviour will be summarily dismissed after proper warning to the student and parents/guardians.',
  'The school authorities maintain a record of the address and phone numbers of parents/guardians in the school office. Parents/guardians are requested to promptly intimate the school authorities of any changes.',
  'Presents in cash or in kind to the teachers are not permitted. Collection of funds for any reason whatsoever within the school premises is also prohibited.',
  'Letters addressed to pupils in the school will not be delivered in the classrooms.',
  'Pupils are not permitted to bring unnecessary books, magazines, newspapers, periodicals or similar articles to the school. They must bring only dry food for the long recess.',
  'Pupils are forbidden to take part in any political or other organisation likely to result in violence or communal disturbance.',
  'Parents/guardians are earnestly requested to enforce regularity and discipline and see that their children do their homework and prepare their lessons daily as per the timetable. Parental co-operation is earnestly solicited not only for the benefit of the pupil but also for the smooth working of the school.',
  'The school observes the “Principles of Discipline” set out in Rule 53 of the Grant-In-Aid Code: regularity and implicit obedience; politeness and courtesy of speech and conduct together with cleanliness of dress and person; and pupils’ responsibility to the school for their conduct both inside and outside it.',
  'No school business will be transacted on Saturdays, Sundays and holidays.',
  'Any pupil who is persistently non-co-operative, repeatedly or wilfully mischievous, guilty of gross malpractice in connection with examinations, or has committed an act of serious indiscipline or misbehaviour, or who in the opinion of the Head of the School has an undesirable influence on fellow pupils, is liable to be expelled permanently or removed for a specific period, with the reasons recorded in writing.',
  'Railway concession forms and other certificates — date of birth, bonafide student, first attempt, leaving certificate and similar — will be issued between 1.00 p.m. and 2.30 p.m. only.',
]

const main = async () => {
  const payload = await getPayload({ config })

  const { docs: units } = await payload.find({
    collection: 'units',
    where: { slug: { equals: 'primary' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const primary = units[0]
  if (!primary) throw new Error('Primary unit not found. Run `npm run seed` first.')

  /**
   * Internal links store a relationship, not a typed path (FR-QL-06), so the
   * institution-wide scholarship register has to exist before Primary can point
   * at it. If it does not, the link is left out rather than seeded as a broken
   * one — the section still reads correctly without it.
   */
  const { docs: scholarshipPages } = await payload.find({
    collection: 'pages',
    where: { and: [{ slug: { equals: 'scholarships' } }, { unit: { exists: false } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const scholarshipsPageId = scholarshipPages[0]?.id ?? null

  if (!scholarshipsPageId) {
    payload.logger.warn(
      'Scholarship register not found — run `npm run seed:scholarships` first, then re-run this seed to add the link.',
    )
  }

  // -- The unit's own details ---------------------------------------------
  await payload.update({
    collection: 'units',
    id: primary.id,
    overrideAccess: true,
    data: {
      // Not "…, Wadala" any more: the unit now covers both campuses, and the
      // main portal prints this name in its school list.
      name: 'SIWS Primary School',
      shortName: 'Primary School',
      tagline: 'Maharashtra State Board | Grades 1 to 4 | Wadala & Matunga',
      description:
        'Grades 1 to 4 following the Maharashtra State Board curriculum, aligned with NEP 2020, at our Wadala and Matunga campuses — nurturing confident, responsible and joyful learners.',
    } as never,
  })

  // -- Faculty (FR-FAC-01) -------------------------------------------------
  let facultyCreated = 0
  let facultyUpdated = 0

  /**
   * BACKFILL, and it must run before the upsert loop.
   *
   * The 13 Wadala teachers were seeded before the campus field existed, so they
   * carry no campus. The loop below matches on name + unit + campus, which
   * would miss every one of them and create a second, duplicate roster. They
   * were all Wadala — that is the only campus this seed had ever covered — so
   * they are stamped as such first.
   */
  const { docs: untagged } = await payload.find({
    collection: 'faculty',
    where: { and: [{ unit: { equals: primary.id } }, { campus: { exists: false } }] },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  for (const teacher of untagged) {
    await payload.update({
      collection: 'faculty',
      id: teacher.id,
      data: { campus: 'wadala' } as never,
      overrideAccess: true,
    })
  }

  if (untagged.length > 0) {
    payload.logger.info(`Tagged ${untagged.length} existing teachers as the Wadala campus.`)
  }

  /**
   * Both rosters, each tagged with its campus. `order` restarts per campus so
   * each campus's head teacher sits at 1 — the Faculty block filters by campus,
   * and a shared sequence would put Matunga's head teacher tenth in her own
   * list.
   */
  const roster = [
    ...FACULTY.map((teacher, index) => ({ ...teacher, campus: 'wadala', order: index + 1 })),
    ...MATUNGA_FACULTY.map((teacher, index) => ({
      ...teacher,
      campus: 'matunga',
      order: index + 1,
    })),
  ]

  for (const teacher of roster) {
    const existing = await payload.find({
      collection: 'faculty',
      where: {
        and: [
          { name: { equals: teacher.name } },
          { unit: { equals: primary.id } },
          // Campus is part of the identity: two campuses may one day employ
          // people of the same name, and matching on name alone would have one
          // seed overwrite the other's teacher.
          { campus: { equals: teacher.campus } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      ...teacher,
      designation: teacher.designation ?? 'Teacher',
      unit: primary.id,
      _status: 'published',
      reviewStatus: 'approved',
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'faculty',
        id: existing.docs[0].id,
        data: data as never,
        overrideAccess: true,
      })
      facultyUpdated += 1
    } else {
      await payload.create({ collection: 'faculty', data: data as never, overrideAccess: true })
      facultyCreated += 1
    }
  }

  payload.logger.info(`Faculty — ${facultyCreated} created, ${facultyUpdated} updated.`)

  // -- Pages ---------------------------------------------------------------
  const upsert = async (page: Record<string, unknown> & { slug: string; title: string }) => {
    const existing = await payload.find({
      collection: 'pages',
      where: { and: [{ slug: { equals: page.slug } }, { unit: { equals: primary.id } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = { ...page, unit: primary.id }

    if (existing.docs[0]) {
      const doc = await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: data as never,
        overrideAccess: true,
      })
      payload.logger.info(`Updated page: ${page.title}`)
      return doc.id
    }

    const doc = await payload.create({
      collection: 'pages',
      data: data as never,
      overrideAccess: true,
    })
    payload.logger.info(`Created page: ${page.title}`)
    return doc.id
  }

  // --------------------------------------------------------- CAMPUS PAGES
  /**
   * Seeded before the home page, because the campus cards there link to these
   * by relationship and the IDs have to exist first.
   */
  const wadalaPageId = await upsert({
    slug: 'wadala',
    title: 'Wadala campus',
    intro:
      'The Primary Section at Wadala — Grades 1 to 4, on the same campus as the K.G. Section and the Secondary School.',
    showInNav: true,
    navLabel: 'Wadala',
    navOrder: 11,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'SIWS Primary School, Wadala — Grades 1 to 4 on the Maharashtra State Board curriculum, with smart classrooms, experienced teachers and a CCTV-monitored campus.',
    layout: [
      {
        blockType: 'hero',
        title: 'SIWS Primary School, Wadala',
        accentWord: 'Wadala',
        eyebrow: 'Maharashtra State Board | Grades 1 to 4',
        intro:
          'A caring, inclusive and stimulating school where the focus extends beyond academic excellence to developing confident, responsible and compassionate individuals.',
      },
      {
        blockType: 'statistics',
        heading: 'A legacy parents trust',
        background: 'sea',
        stats: [
          { value: '1934', label: 'Serving Mumbai since' },
          { value: '90+', label: 'Years of educational service' },
          { value: 'A Grade', label: 'Department of Education' },
          { value: '20+', label: 'Years average teaching experience' },
        ],
      },
      {
        blockType: 'richText',
        heading: 'On one campus, from K.G. to Standard X',
        accentWord: 'K.G. to Standard X',
        headingLevel: 'h2',
        width: 'normal',
        background: 'white',
        content: richText([
          'The Wadala campus is the full SIWS school — a K.G. Section, Primary School and Secondary School on one site, so a child can move from Kindergarten to Standard X without ever changing schools.',
        ]),
      },
      {
        blockType: 'featureList',
        heading: 'Subjects',
        accentWord: 'Subjects',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'sea',
        items: SUBJECTS,
      },
      {
        blockType: 'featureList',
        heading: 'Grade by grade',
        accentWord: 'Grade by grade',
        headingLevel: 'h2',
        marker: 'number',
        columns: '1',
        background: 'white',
        intro: richText([
          'Our Primary Section follows the Maharashtra State Board curriculum (SCERT Maharashtra / Balbharati), aligned with the National Education Policy 2020 and its competency-based approach (PARAKH).',
        ]),
        items: GRADE_CURRICULUM,
      },
      {
        blockType: 'featureList',
        heading: 'How we teach',
        accentWord: 'teach',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'sea',
        intro: richText([
          'Every child learns differently. Our classrooms are interactive, inclusive and learner-centred, with teachers acting as facilitators who encourage children to think, explore and discover.',
        ]),
        items: TEACHING_PRACTICES,
      },
      {
        blockType: 'featureList',
        heading: 'Beyond academics',
        accentWord: 'Beyond academics',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: HOLISTIC,
      },
      {
        blockType: 'featureList',
        heading: 'What the Wadala programme offers',
        accentWord: 'Wadala programme',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'sea',
        items: PROGRAMME_BENEFITS,
      },
      {
        blockType: 'featureList',
        heading: 'Why parents choose SIWS Wadala',
        accentWord: 'SIWS Wadala',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: USPS,
      },
      {
        blockType: 'faculty',
        heading: 'Teachers at Wadala',
        accentWord: 'Wadala',
        headingLevel: 'h2',
        campus: 'wadala',
        showQualifications: true,
        background: 'sea',
        intro: richText([
          'Our teachers are well trained, with over 20 years of teaching experience.',
        ]),
      },
      {
        blockType: 'featureList',
        heading: 'Competitions and prizes',
        accentWord: 'Competitions',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: COMPETITIONS,
      },
      {
        blockType: 'richText',
        heading: 'Safe, secure and disciplined',
        accentWord: 'Safe',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'sea',
        content: richText([
          'The entire campus — classrooms, corridors, entrances and common areas — is monitored by CCTV. Well-defined safety protocols, disciplined practices and vigilant supervision give parents confidence that their children are learning in a safe, caring and protected atmosphere.',
        ]),
      },
    ],
  })

  const matungaPageId = await upsert({
    slug: 'matunga',
    title: 'Matunga campus',
    intro:
      'The Primary Section at Matunga — Grades 1 to 4, opened within two years of the school’s founding.',
    showInNav: true,
    navLabel: 'Matunga',
    navOrder: 12,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'SIWS Primary School, Matunga — Grades 1 to 4 on the Maharashtra State Board curriculum, with a nine-strong teaching team and a safe, disciplined campus.',
    layout: [
      {
        blockType: 'hero',
        title: 'SIWS Primary School, Matunga',
        accentWord: 'Matunga',
        eyebrow: 'Maharashtra State Board | Standards I to IV',
        intro:
          'A journey of learning, growing and achieving — building tomorrow’s achievers through personalised learning, innovative teaching, strong values and a nurturing environment from the very first step.',
      },
      {
        blockType: 'statistics',
        heading: 'A legacy parents trust',
        background: 'sea',
        stats: [
          { value: '1934', label: 'SIWS founded' },
          { value: '1936', label: 'Matunga Primary opened' },
          { value: 'A Grade', label: 'Department of Education' },
          { value: 'State Board', label: 'Maharashtra' },
        ],
      },
      {
        blockType: 'richText',
        heading: 'SIWS Primary School, Matunga',
        accentWord: 'Matunga',
        headingLevel: 'h2',
        width: 'normal',
        background: 'white',
        content: richText([
          'A journey of learning, growing and achieving. The school provides a seamless educational pathway from Standard I to Standard IV, with a strong focus on knowledge, values, creativity and confidence.',
          'Building tomorrow’s achievers through personalised learning, innovative teaching, strong values, and a nurturing environment from the very first step.',
        ]),
      },
      {
        blockType: 'richText',
        heading: 'How Matunga began',
        accentWord: 'Matunga',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'sea',
        content: richText([
          'SIWS School made a humble beginning in the year 1934 with just 4 students at Shivaji Park. Within the next two years the Primary Section was opened at Matunga, and in order to cope with the heavy demand for admission the Wadala School was opened.',
          'Years of dedication, learning and success have shaped our journey of nurturing confident and compassionate young minds.',
        ]),
      },
      {
        blockType: 'featureList',
        heading: 'Subjects taught at Matunga',
        accentWord: 'Subjects',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: MATUNGA_SUBJECTS,
      },
      {
        blockType: 'featureList',
        heading: 'What the Matunga programme offers',
        accentWord: 'Matunga programme',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'tint',
        items: MATUNGA_BENEFITS,
      },
      {
        blockType: 'richText',
        heading: 'Our curriculum',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'white',
        content: richText([
          'Our primary curriculum nurtures curiosity through activity-based, experiential learning that strengthens literacy, numeracy, creativity, critical thinking and life skills in a joyful classroom environment.',
          'Where learning extends beyond books — empowering young minds through creativity, expression, exploration and meaningful experiences every day, through festival and event celebrations.',
        ]),
      },
      {
        blockType: 'faculty',
        heading: 'Teachers at Matunga',
        accentWord: 'Matunga',
        headingLevel: 'h2',
        campus: 'matunga',
        showQualifications: true,
        background: 'sea',
        intro: richText([
          'With knowledge and passion, our teachers create a classroom where every child feels encouraged to explore and succeed.',
        ]),
      },
      {
        blockType: 'richText',
        heading: 'Admission to Matunga',
        accentWord: 'Admission',
        headingLevel: 'h2',
        width: 'normal',
        background: 'white',
        content: richText([
          'Our admission process is simple, transparent and parent-friendly. Eligible students can apply by submitting the required documents, completing the admission formalities and interacting with the school as per the prescribed guidelines.',
          'Every pupil seeking admission for the first time must produce their Birth Certificate, Aadhaar card and Ration card issued by a competent authority.',
        ]),
      },
      {
        blockType: 'richText',
        heading: 'The academic year',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'sea',
        content: richText([
          'An enriching year-round learning experience, with a balanced schedule that encourages academic excellence and holistic growth.',
        ]),
      },
      {
        blockType: 'featureList',
        heading: 'School rules — Matunga',
        accentWord: 'Matunga',
        headingLevel: 'h2',
        marker: 'number',
        columns: '1',
        background: 'white',
        items: MATUNGA_RULES.map((title) => ({ title })),
      },
      {
        blockType: 'featureList',
        heading: 'What sets Matunga apart',
        accentWord: 'Matunga',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'sea',
        items: [
          {
            title: 'A Grade recognition',
            description:
              'Granted A Grade status by the Department of Education following improvements in infrastructure, teaching and other parameters. Recognised by the Maharashtra State Board.',
          },
          {
            title: 'Experienced faculty',
            description:
              'With knowledge and passion, our teachers create a classroom where every child feels encouraged to explore and succeed.',
          },
          {
            title: 'Modern facilities',
            description: 'Smart classrooms and well-equipped labs.',
          },
          {
            title: 'Personalised learning',
            description:
              'Building tomorrow’s achievers through personalised learning, innovative teaching and strong values.',
          },
        ],
      },
      {
        blockType: 'richText',
        heading: 'A safe and disciplined campus',
        accentWord: 'safe',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'white',
        content: richText([
          'A secure and caring environment where children learn with confidence, respect, responsibility and positive values.',
        ]),
      },
    ],
  })

  // --------------------------------------------------------------- CONTACT
  /**
   * The enquiry form lives here now, not on the home page.
   *
   * Seeded before `home` because the home hero links to it by relationship,
   * and an internal link needs its target to exist first (FR-QL-06).
   */
  const contactPageId = await upsert({
    slug: 'contact',
    title: 'Contact us',
    intro: 'Ask us about admission to Grades 1 to 4 at Wadala or Matunga.',
    showInNav: true,
    navLabel: 'Contact',
    navOrder: 50,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'Contact SIWS Primary School — enquire about admission to Grades 1 to 4 at our Wadala and Matunga campuses.',
    layout: [
      {
        blockType: 'heroEnquiry',
        title: 'Enquire about admission',
        subtitle: 'Maharashtra State Board | Grades 1 to 4 | Wadala & Matunga',
        benefitsIntro: 'At SIWS, your child benefits from:',
        benefits: [
          { text: 'A strong academic foundation on the Maharashtra State Board curriculum' },
          { text: 'Interactive, technology-enabled smart classrooms' },
          { text: 'A safe and secure campus with CCTV surveillance' },
          { text: 'Teachers with 20+ years of classroom experience' },
        ],
        badge: {
          title: 'Admissions as per Education Department norms',
          subtitle: 'Grades 1 to 4 | Subject to vacancies',
        },
        form: {
          title: 'Enquire about admission',
          subtitle: 'Tell us about your child and we will get in touch.',
          classOptions: CLASS_OPTIONS.map((label) => ({ label })),
          // Both campuses, so the parent chooses and the enquiry reaches the
          // right head teacher.
          campusOptions: [{ campus: 'wadala' }, { campus: 'matunga' }],
          trustPoints: [
            { text: 'Over 90 years of educational service since 1934' },
            { text: 'A Grade school' },
            { text: 'Experienced and trained teachers' },
            { text: 'Safe, CCTV-monitored campus' },
          ],
        },
      },
      {
        blockType: 'cardGrid',
        heading: 'Who to contact',
        headingLevel: 'h2',
        columns: '2',
        background: 'white',
        cards: [
          {
            title: 'Admissions',
            description:
              'For enquiries about Grades 1 to 4 at either campus — admissions@siws.edu.in',
          },
          {
            title: 'General enquiries',
            description: 'For anything else — info@siws.edu.in',
          },
        ],
      },
    ],
  })

  // ------------------------------------------------------------------ HOME
  await upsert({
    slug: 'home',
    title: 'SIWS Primary School',
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'SIWS Primary School — Grades 1 to 4 on the Maharashtra State Board curriculum at two campuses, Wadala and Matunga. Smart classrooms, experienced teachers and safe, CCTV-monitored campuses.',
    layout: [
      /**
       * The enquiry form moved to the contact page. This hero carries the same
       * headline and the same four reasons, and sends anyone ready to enquire
       * one click onward — so the home page opens on the school rather than on
       * a form.
       */
      {
        blockType: 'hero',
        title: 'SIWS Primary School',
        accentWord: 'Primary',
        eyebrow: 'Maharashtra State Board | Grades 1 to 4 | Wadala & Matunga',
        // Plain string: the hero's `intro` is a textarea, not rich text.
        intro:
          'A caring, inclusive and stimulating school for Grades 1 to 4 — with smart classrooms, teachers of 20+ years’ experience, and safe, CCTV-monitored campuses at Wadala and Matunga.',
        links: [
          {
            link: {
              label: 'Enquire about admission',
              type: 'internal',
              reference: { relationTo: 'pages', value: contactPageId },
              appearance: 'primary',
            },
          },
        ],
      },
      {
        blockType: 'cardGrid',
        heading: 'Our two campuses',
        accentWord: 'two campuses',
        headingLevel: 'h2',
        background: 'white',
        intro: richText([
          'The Primary Section runs at Wadala and at Matunga. Both follow the same board and the same curriculum for Grades 1 to 4, and each has its own head teacher and teaching team.',
        ]),
        columns: '2',
        cards: [
          {
            /**
             * No teacher count. A raw headcount invites a parent to read one
             * campus as better resourced than the other, when the two have
             * different intakes — and it would go stale the moment somebody
             * joins or leaves. The rosters themselves are on the teachers page.
             */
            title: 'Wadala campus',
            description:
              'Part of the full SIWS campus at Wadala, alongside the K.G. Section and the Secondary School.',
            cta: [
              {
                link: {
                  label: 'About the Wadala campus',
                  type: 'internal',
                  reference: { relationTo: 'pages', value: wadalaPageId },
                },
              },
            ],
          },
          {
            title: 'Matunga campus',
            description:
              'The Primary Section opened at Matunga within two years of the school’s founding in 1934.',
            cta: [
              {
                link: {
                  label: 'About the Matunga campus',
                  type: 'internal',
                  reference: { relationTo: 'pages', value: matungaPageId },
                },
              },
            ],
          },
        ],
      },
      {
        blockType: 'richText',
        heading: 'A caring, inclusive and stimulating school',
        accentWord: 'caring',
        headingLevel: 'h2',
        width: 'normal',
        background: 'white',
        content: richText([
          'At SIWS Primary School, we are committed to nurturing every child in a caring, inclusive and stimulating environment. Our focus extends beyond academic excellence to developing confident, responsible and compassionate individuals.',
          'At SIWS Primary School, we don’t just educate children — we inspire lifelong learners, responsible citizens and future leaders.',
        ]),
      },
      {
        blockType: 'statistics',
        heading: 'A legacy parents trust',
        background: 'sea',
        stats: [
          { value: '1934', label: 'Serving Mumbai since' },
          { value: '90+', label: 'Years of educational service' },
          { value: 'A Grade', label: 'School recognition' },
          { value: '20+', label: 'Years average teaching experience' },
        ],
      },
      {
        blockType: 'featureList',
        heading: 'What our Primary programme offers',
        accentWord: 'Primary programme',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: PROGRAMME_BENEFITS,
      },
      {
        blockType: 'featureList',
        heading: 'Why parents choose SIWS Primary',
        accentWord: 'SIWS Primary',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'tint',
        items: USPS,
      },
      {
        blockType: 'richText',
        heading: 'Safe, Secure & Disciplined Campus',
        accentWord: 'Safe',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'white',
        content: richText([
          'The safety and well-being of every child is our highest priority. The entire school campus — including classrooms, corridors, entrances and common areas — is monitored through a comprehensive CCTV surveillance system to ensure a secure learning environment.',
          'Well-defined safety protocols, disciplined practices and vigilant supervision provide parents with confidence that their children are learning in a safe, caring and protected atmosphere.',
        ]),
      },
      {
        blockType: 'callToAction',
        heading: 'Come and see the school for yourself',
        background: 'brand',
        text: richText(['Our admissions team is happy to talk you through the process.']),
        links: [
          {
            link: {
              label: 'Email the admissions team',
              type: 'external',
              url: 'mailto:admissions@siws.edu.in',
              appearance: 'primary',
            },
          },
        ],
      },
    ],
  })

  // ------------------------------------------------------------- ACADEMICS
  await upsert({
    slug: 'academics',
    title: 'Academics',
    intro:
      'Grades 1 to 4, following the Maharashtra State Board (SCERT / Balbharati) curriculum and aligned with the National Education Policy 2020.',
    showInNav: true,
    navLabel: 'Academics',
    navOrder: 20,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'The SIWS Primary curriculum for Grades 1 to 4 — Maharashtra State Board, NEP 2020 aligned, with competency-based and activity-oriented learning.',
    layout: [
      {
        blockType: 'richText',
        heading: 'Curriculum & Teaching Methodology',
        accentWord: 'Teaching Methodology',
        headingLevel: 'h2',
        width: 'normal',
        background: 'white',
        content: richText([
          'Our Primary Section (Grades 1 to 4) follows the curriculum prescribed by the Maharashtra State Board (SCERT Maharashtra / Balbharati), aligned with the principles of the National Education Policy (NEP) 2020.',
          'The curriculum is designed to nurture confident, responsible and joyful learners by developing strong academic foundations along with essential life skills through competency-based and activity-oriented learning (PARAKH).',
        ]),
      },
      {
        blockType: 'featureList',
        heading: 'Subjects taught',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'sea',
        items: SUBJECTS,
      },
      {
        blockType: 'featureList',
        heading: 'Grade by grade',
        accentWord: 'Grade by grade',
        headingLevel: 'h2',
        marker: 'number',
        columns: '1',
        background: 'white',
        items: GRADE_CURRICULUM,
      },
      {
        blockType: 'richText',
        heading: 'Our Teaching Methodology',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'tint',
        content: richText([
          'We believe that every child learns differently. Our classrooms are interactive, inclusive and learner-centred, where teachers act as facilitators, encouraging children to think, explore and discover.',
        ]),
      },
      {
        blockType: 'featureList',
        heading: 'Our teaching practices',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: TEACHING_PRACTICES,
      },
      {
        blockType: 'featureList',
        heading: 'Holistic Development',
        accentWord: 'Holistic',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'sea',
        items: HOLISTIC,
      },
      {
        blockType: 'featureList',
        heading: 'Competitions held through the year',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '2',
        background: 'white',
        items: COMPETITIONS,
      },
      {
        blockType: 'richText',
        heading: 'Academic year and promotion',
        headingLevel: 'h2',
        width: 'normal',
        background: 'tint',
        content: richText([
          'The school follows the promotion guidelines prescribed by the Government of Maharashtra and the School Education Department.',
          'Students of Grades 1 to 4 are continuously assessed throughout the academic year through classroom participation, assignments, projects, oral and written assessments, and overall performance. Promotion to the next grade is based on the student’s continuous progress and holistic development, in accordance with the prevailing Government norms.',
          'Students requiring additional academic support are provided with appropriate guidance and remedial assistance to help them achieve the expected learning outcomes.',
        ]),
      },
    ],
  })

  // --------------------------------------------------------------- TEACHERS
  await upsert({
    slug: 'teachers',
    title: 'Our teachers',
    intro:
      'Our qualified and experienced teachers use child-centred, activity-based and competency-driven teaching strategies.',
    showInNav: true,
    navLabel: 'Teachers',
    navOrder: 30,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'Meet the teaching teams at SIWS Primary School — experienced, qualified staff at both the Wadala and Matunga campuses.',
    layout: [
      /**
       * Two blocks, one per campus, rather than a single list of 22 names. A
       * parent reading this page has already chosen a location; an unlabelled
       * merged roster would leave them unable to tell who teaches their child.
       */
      {
        blockType: 'faculty',
        heading: 'Teachers at Wadala',
        accentWord: 'Wadala',
        headingLevel: 'h2',
        campus: 'wadala',
        showQualifications: true,
        background: 'white',
        intro: richText([
          'Our teachers are well trained, with over 20 years of teaching experience.',
        ]),
      },
      {
        blockType: 'faculty',
        heading: 'Teachers at Matunga',
        accentWord: 'Matunga',
        headingLevel: 'h2',
        campus: 'matunga',
        showQualifications: true,
        background: 'sea',
        intro: richText([
          'With knowledge and passion, our teachers create a classroom where every child feels encouraged to explore and succeed.',
        ]),
      },
    ],
  })

  // ------------------------------------------------------------- ADMISSIONS
  await upsert({
    slug: 'admissions',
    title: 'Admissions',
    intro:
      'Admissions to the Primary Section are conducted in accordance with the guidelines and norms prescribed by the Education Department, Government of Maharashtra.',
    showInNav: true,
    navLabel: 'Admissions',
    navOrder: 10,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'How admission to SIWS Primary School, Wadala works for Grades 1 to 4, under Education Department norms.',
    layout: [
      {
        blockType: 'featureList',
        heading: 'How admission works',
        accentWord: 'admission',
        headingLevel: 'h2',
        marker: 'number',
        columns: '1',
        background: 'white',
        items: [
          {
            title: 'Grade 1 — from our Pre-Primary Section',
            description:
              'Children from our Pre-Primary Section are promoted to Grade 1 upon submission of the prescribed admission form and completion of the required formalities, as per the Education Department’s norms.',
          },
          {
            title: 'Grade 1 — new admissions',
            description:
              'Fresh admissions to Grade 1 are offered only if vacancies are available after the admission process for students from the Pre-Primary Section is completed.',
          },
          {
            title: 'Grades 2, 3 and 4',
            description:
              'Admissions to these grades are considered only against vacant seats, subject to the school’s admission policy and the applicable rules and regulations of the Education Department.',
          },
        ],
      },
      {
        blockType: 'richText',
        heading: 'Scholarships',
        headingLevel: 'h2',
        width: 'normal',
        background: 'sea',
        content: richText([
          'SIWS administers 151 scholarship and endowment funds, given by well-wishers of the institution over more than nine decades. They are awarded right across the institution, from the Kindergarten Section through to the S.S.C. Examination.',
        ]),
      },
      {
        /**
         * Only funds whose own wording names the Primary section or Standards
         * I–IV are listed here. The rest are on the institution-wide register —
         * a Primary page claiming a Standard X award would mislead a parent.
         */
        blockType: 'featureList',
        heading: 'Funds awarded to Primary pupils',
        accentWord: 'Primary pupils',
        headingLevel: 'h3',
        marker: 'tick',
        columns: '1',
        background: 'sea',
        items: [
          {
            title: 'Ms. G. Radha Head Teacher Primary School, Wadala Endowment Scholarship Fund',
            description: 'For standing first in each standard, i.e., from I to IV.',
          },
          {
            title: 'Mrs. Sakuntala Nair Head Teacher Wadala Primary Section Merit Scholarship Fund',
            description: 'For the rank holder of Standard IV.',
          },
          {
            title: 'Mrs. B. Sarasa Mani – Head Teacher, Wadala Primary Section Endowment Scholarship Fund',
            description:
              'Awarded to the student who secures the highest marks in Mathematics in Standard IV (one from each of the three divisions).',
          },
          {
            title: 'Mr. K. Raman Memorial Scholarship Fund',
            description: 'To 4th Standard students scoring highest marks in Mathematics.',
          },
          {
            title: 'Mrs. Lakshmi Ammal Commemoration Scholarship Fund',
            description: 'To be awarded to the pupil who stands first in each standard.',
          },
          {
            title: 'Smt. Thirumalai Narasimha Iyengar Commemoration Scholarship Fund',
            description: 'To be awarded to the pupil who stands first in each standard.',
          },
          {
            title: 'Smt. T. Janaki Ammal Scholarship Fund',
            description: 'To a deserving student from the Primary Section.',
          },
          {
            title: 'Shri. S. Ramanathan Endowment Scholarship Fund',
            description: 'To a financially weak deserving student in the Primary or Secondary Section.',
          },
          {
            title: 'Shri. V.A. Venugopal Endowment Scholarship Fund',
            description: 'To a financially weak and deserving boy or girl of Standards I to X.',
          },
          {
            title: 'Late Mrs. T. S. Swaminathan Merit Scholarship Fund',
            description: 'To students from K.G. to Secondary.',
          },
          {
            title: 'Late Mrs. Meenakshi Swaminathan Scholarship Fund',
            description: 'To the needy student from K.G. to Secondary.',
          },
        ],
      },
      ...(scholarshipsPageId
        ? [
            {
              blockType: 'callToAction',
              heading: 'See every SIWS scholarship fund',
              background: 'tint',
              text: richText([
                'The complete register of all 151 merit, open and arts funds is published for the whole institution.',
              ]),
              links: [
                {
                  link: {
                    label: 'View the full scholarship register',
                    type: 'internal',
                    reference: { relationTo: 'pages', value: scholarshipsPageId },
                    appearance: 'secondary',
                  },
                },
              ],
            },
          ]
        : []),
      {
        blockType: 'callToAction',
        heading: 'Questions about admission?',
        background: 'brand',
        text: richText(['Our admissions team is happy to talk you through the process.']),
        links: [
          {
            link: {
              label: 'Email the admissions team',
              type: 'external',
              url: 'mailto:admissions@siws.edu.in',
              appearance: 'primary',
            },
          },
        ],
      },
    ],
  })

  // ------------------------------------------------------- RULES & UNIFORM
  await upsert({
    slug: 'school-rules',
    title: 'School rules and uniform',
    intro: 'What we ask of pupils and parents, and what our pupils wear.',
    showInNav: true,
    navLabel: 'Rules & uniform',
    navOrder: 40,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      'General rules, discipline and uniform guidelines for SIWS Primary School — Wadala and Matunga campuses.',
    layout: [
      {
        /**
         * The uniform specification below is the one Wadala supplied. Matunga's
         * document says only "wear proper school uniform" and gives no detail,
         * so this is labelled as Wadala's rather than presented as the Primary
         * Section's — a family at Matunga must not buy a uniform on the
         * strength of a page that never checked.
         */
        blockType: 'featureList',
        heading: 'Uniform — Wadala campus',
        accentWord: 'Wadala campus',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '1',
        background: 'white',
        items: [
          {
            title: 'Girls',
            description:
              'Off-white striped half-sleeve shirt, biscuit-colour pinafore with V neck and box pleats reaching below the knee, red tie and red cross belt. Hair tied in two plaits with red ribbons.',
          },
          {
            title: 'Boys',
            description:
              'Off-white striped half-sleeve shirt and biscuit-colour half pants, red tie and red cross belt.',
          },
          { title: 'Cloth', description: 'Terry Cott.' },
          {
            title: 'Sweater',
            description: 'During the winter season, for both boys and girls — maroon colour only.',
          },
          {
            title: 'Footwear',
            description:
              'All-season black shoes with Velcro strap and biscuit-colour socks. Chappals and sandals are allowed only during the rainy season.',
          },
          {
            title: 'P.T. uniform',
            description: 'P.T. uniform should be worn on all Wednesdays.',
          },
        ],
      },
      {
        blockType: 'featureList',
        heading: 'General rules — Wadala campus',
        accentWord: 'Wadala campus',
        headingLevel: 'h2',
        marker: 'number',
        columns: '1',
        background: 'sea',
        items: GENERAL_RULES.map((title) => ({ title })),
      },
      {
        /**
         * Matunga's rules are kept as their own list rather than merged with
         * Wadala's. They are not a shortened version of the same document —
         * Matunga sets an 80% attendance requirement and an English-only rule
         * that Wadala's list does not contain, and Wadala's covers infectious
         * illness, identity cards and railway concession hours that Matunga's
         * does not. Merging them would attach each campus's rules to families
         * who are not bound by them.
         */
        blockType: 'featureList',
        heading: 'General rules — Matunga campus',
        accentWord: 'Matunga campus',
        headingLevel: 'h2',
        marker: 'number',
        columns: '1',
        background: 'white',
        items: MATUNGA_RULES.map((title) => ({ title })),
      },
    ],
  })

  payload.logger.info('Primary content seeded — Wadala and Matunga campuses.')

  payload.logger.warn(
    'STILL TO COME from SIWS (both campuses): fee details; campus, classroom and facility photographs; teacher photographs; parent testimonials; alumni achievements; press mentions; awards and certifications; social media handles; and the legal documents (privacy policy, terms, fee/refund policy, RTI disclosures). No page invents any of these.',
  )
  payload.logger.warn(
    'MATUNGA SPECIFICALLY: no uniform specification, no admission age criteria and no campus contact details were supplied. The uniform section is labelled as Wadala’s only, and no Matunga uniform is stated.',
  )
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    // Payload nests field errors inside `data.errors`, which the default
    // console output prints as `[Object]` — useless for finding which field
    // actually failed.
    const nested = (error as { data?: { errors?: unknown[] } })?.data?.errors
    if (Array.isArray(nested)) {
      console.error('Primary seed failed. Field errors:')
      for (const item of nested) console.error('  •', JSON.stringify(item))
    } else {
      console.error('Primary seed failed:', error)
    }
    process.exit(1)
  })

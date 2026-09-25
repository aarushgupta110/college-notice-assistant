/**
 * data.js — Sample notices and demo data for College Notice Assistant
 * Used in demo mode when no AI API key is configured.
 */

const SAMPLE_NOTICES = [
  {
    id: 'sample_1',
    title: 'Mid-Semester Examination Schedule',
    rawText: `NOTICE
EXAMINATION CELL — MID-SEMESTER EXAMINATIONS

This is to notify all students of B.Tech (1st, 2nd, 3rd, and 4th Year) that the Mid-Semester Examinations for the academic year 2026-27 (Odd Semester) will be held as per the following schedule:

Examination Dates: October 10, 2026 to October 18, 2026

Hall tickets will be issued from the Examination Cell from October 5, 2026 onwards. Students who have not cleared their dues will NOT be issued hall tickets. Students with attendance below 75% are NOT eligible to appear for the examination.

Practical examinations for 2nd Year students will be held between October 20 to October 25, 2026.

Date sheet for individual subjects will be displayed on the department notice boards and college website by September 28, 2026.

Students must carry their college ID card and hall ticket to the examination hall. Mobile phones are strictly prohibited inside the examination hall.

Any student found using unfair means will be immediately expelled from the examination and appropriate disciplinary action will be taken as per the college regulations.

For queries, contact the Examination Cell: examcell@college.edu

By Order,
Controller of Examinations
Dated: September 22, 2026`,
    description: 'Exam schedule for B.Tech all years — October 2026',
    tags: ['all years', 'exams', 'deadlines']
  },
  {
    id: 'sample_2',
    title: 'Fee Payment & Scholarship Application Notice',
    rawText: `OFFICE OF THE REGISTRAR
IMPORTANT NOTICE — FEE PAYMENT & SCHOLARSHIP

This notice is addressed to all students of 2nd, 3rd, and 4th year B.Tech and M.Tech programs.

1. ANNUAL FEE PAYMENT:
   Last date to submit annual fees (Semester II) without penalty: October 1, 2026
   With late fee of Rs. 500 per week: October 8 to October 22, 2026
   Students who fail to pay fees by October 22, 2026 will be de-registered and will not be permitted to attend classes or examinations.

2. SCHOLARSHIP APPLICATIONS:
   National Merit Scholarship applications are now open for academically meritorious students from all departments.
   Eligibility: Minimum CGPA of 8.0 in the previous semester, family income below Rs. 8 lakh per annum.
   Last date to submit application form: October 12, 2026
   Documents required: Income certificate, previous semester marksheet, caste certificate (if applicable), bank account details.
   Incomplete applications will be rejected without notice.

3. SPORTS SCHOLARSHIP:
   Applications are invited for sports scholarships for students who have represented at National/State level.
   Apply at the Sports Department office. Last date: October 7, 2026.

Fee payment can be done online via the student portal (portal.college.edu) or at the accounts office (Room 105, Administrative Block) between 9 AM and 3 PM on working days.

Registrar`,
    description: 'Fee payment deadlines and scholarship applications for B.Tech/M.Tech 2nd–4th year',
    tags: ['fees', 'scholarship', '2nd year', '3rd year', '4th year']
  },
  {
    id: 'sample_3',
    title: 'Industrial Training & Internship Guidelines',
    rawText: `TRAINING & PLACEMENT CELL
NOTICE REGARDING INDUSTRIAL TRAINING / INTERNSHIP — 2026

Attention: All 3rd Year B.Tech Students (all departments)

This notice is to inform all 3rd year B.Tech students that Industrial Training of 4 weeks is mandatory as per the curriculum. The training must be completed during the winter break (December 20, 2026 to January 17, 2027).

KEY DEADLINES:

1. Company confirmation letter must be submitted to the Training & Placement Cell by: November 15, 2026
   Failure to submit by this date will result in the student being awarded a FAIL grade in the Industrial Training subject (IT-601), which is a core subject and cannot be compensated.

2. Online registration on the college training portal (training.college.edu) must be completed by: November 10, 2026.

3. Internship Report must be submitted within 2 weeks of completing training: by January 31, 2027.

4. Presentation/viva will be held in the first week of February 2027. Exact dates will be announced later.

Students may arrange their own training or avail of the T&P Cell's facilitated placements. The T&P Cell has tie-ups with companies in sectors including IT, manufacturing, and core engineering. To avail T&P Cell placement, register your preference by October 10, 2026.

Students already placed for an internship through campus placement drives are exempted from this requirement. They must submit proof of their internship offer letter to the T&P Cell by November 15, 2026.

For queries: placement@college.edu or Room 210, T&P Block, between 2–4 PM on working days.

Head, Training & Placement Cell`,
    description: 'Mandatory 4-week industrial training for 3rd year B.Tech — winter break 2026',
    tags: ['3rd year', 'internship', 'training', 'mandatory']
  },
  {
    id: 'sample_4',
    title: 'Cultural Fest Participation Notice',
    rawText: `STUDENTS' UNION — ANNUAL CULTURAL FESTIVAL "UTSAV 2026"

Dear Students,

We are excited to announce the Annual Cultural Festival "UTSAV 2026" scheduled from November 14 to 16, 2026.

EVENTS:
- Music (Solo & Group), Dance, Drama, Poetry, Fine Arts, Photography
- Technical Quiz, Coding Contest, Debate
- Fashion Show (open to all years and departments)
- Food Stall applications: Each department/hostel can apply for one food stall

REGISTRATION:
All students wishing to participate in any event must register online at utsav.college.edu by October 25, 2026. On-the-spot registration will NOT be available.

Event entry fees (where applicable) to be paid at the time of registration.

IMPORTANT NOTE FOR HOSTEL RESIDENTS: Permission slips for late-night return (after 10 PM on November 14-15) must be obtained from your hostel warden by November 10, 2026.

VOLUNTEER OPPORTUNITIES: Students interested in volunteering for the organizing committee should fill out the volunteer form by October 15, 2026.

Prizes worth Rs. 2 lakh to be won across all events!

Note: Students with active backlogs (more than 2 subjects) are not eligible for prize money but may still participate.

General Secretary, Students' Union`,
    description: 'Annual cultural festival UTSAV 2026 — Nov 14-16, registration open for all students',
    tags: ['all students', 'cultural fest', 'optional', 'events']
  }
];

/**
 * Pre-analyzed demo results corresponding to each sample notice.
 * These are used in demo mode to show fully analyzed results without an API key.
 */
const DEMO_ANALYSES = {
  sample_1: {
    title: 'Mid-Semester Examination Schedule (B.Tech — All Years)',
    summary: 'The Examination Cell announces mid-semester exams for all B.Tech students (1st–4th year) from October 10–18, 2026. Hall tickets are required and students must clear dues and maintain 75% attendance to be eligible. Practical exams for 2nd year run October 20–25.',
    whoAffected: 'All B.Tech students (1st, 2nd, 3rd, and 4th year). 2nd year students additionally face practical exams. Students with dues or below 75% attendance are not eligible.',
    changes: 'Mid-semester examination schedule announced for odd semester 2026-27. Dates are confirmed.',
    importantDates: [
      { date: 'September 28, 2026', event: 'Date sheet display on notice boards and website', type: 'informational' },
      { date: 'October 5, 2026',    event: 'Hall ticket distribution begins from Examination Cell', type: 'action' },
      { date: 'October 10–18, 2026', event: 'Mid-Semester Examinations', type: 'deadline' },
      { date: 'October 20–25, 2026', event: 'Practical Exams (2nd Year only)', type: 'deadline' }
    ],
    tasks: [
      {
        id: 't1_1',
        description: 'Clear all pending dues to become eligible for hall ticket',
        deadline: 'Before October 5, 2026',
        deadlineISO: '2026-10-04',
        priority: 'CRITICAL',
        importance: 'Students with pending dues will NOT be issued hall tickets and cannot appear for the exam.',
        excerpt: 'Students who have not cleared their dues will NOT be issued hall tickets.',
        affectedGroups: ['all', 'all years', 'btec'],
        applicability: 'certain'
      },
      {
        id: 't1_2',
        description: 'Verify your attendance is at or above 75% to maintain exam eligibility',
        deadline: 'Before October 10, 2026',
        deadlineISO: '2026-10-09',
        priority: 'CRITICAL',
        importance: 'Students with attendance below 75% are NOT eligible to appear in the examination.',
        excerpt: 'Students with attendance below 75% are NOT eligible to appear for the examination.',
        affectedGroups: ['all', 'all years', 'btec'],
        applicability: 'certain'
      },
      {
        id: 't1_3',
        description: 'Collect hall ticket from Examination Cell (from October 5 onwards)',
        deadline: 'October 5–10, 2026',
        deadlineISO: '2026-10-09',
        priority: 'HIGH',
        importance: 'Hall ticket is mandatory to enter the examination hall. Must carry it along with college ID.',
        excerpt: 'Hall tickets will be issued from the Examination Cell from October 5, 2026 onwards.',
        affectedGroups: ['all', 'all years', 'btec'],
        applicability: 'certain'
      },
      {
        id: 't1_4',
        description: 'Check the date sheet for your individual subjects on notice boards or college website',
        deadline: 'September 28, 2026',
        deadlineISO: '2026-09-28',
        priority: 'MEDIUM',
        importance: 'Date sheet will be published September 28 — review it early to plan your exam preparation.',
        excerpt: 'Date sheet for individual subjects will be displayed on the department notice boards and college website by September 28, 2026.',
        affectedGroups: ['all', 'all years', 'btec'],
        applicability: 'certain'
      },
      {
        id: 't1_5',
        description: 'Prepare for Practical Exams (2nd Year students only)',
        deadline: 'October 20–25, 2026',
        deadlineISO: '2026-10-20',
        priority: 'HIGH',
        importance: 'Practical examinations are scheduled immediately after the main mid-sems for 2nd year students.',
        excerpt: 'Practical examinations for 2nd Year students will be held between October 20 to October 25, 2026.',
        affectedGroups: ['2nd year', '2nd', 'second year'],
        applicability: 'certain'
      }
    ]
  },

  sample_2: {
    title: 'Fee Payment & Scholarship Application (2nd–4th Year B.Tech & M.Tech)',
    summary: 'The Registrar\'s office announces the last dates for Semester II fee payment with and without late fees, National Merit Scholarship applications (CGPA ≥ 8.0), and Sports Scholarship applications. Non-payment by October 22 results in de-registration.',
    whoAffected: 'All students of 2nd, 3rd, and 4th year B.Tech and M.Tech programs. Scholarship eligibility has additional criteria (CGPA ≥ 8.0, income limit, or sports achievement).',
    changes: 'Fee payment window open with penalties after October 1. Scholarship applications open for current semester.',
    importantDates: [
      { date: 'October 1, 2026',  event: 'Last date to pay fees without late penalty', type: 'deadline' },
      { date: 'October 7, 2026',  event: 'Last date for Sports Scholarship application', type: 'deadline' },
      { date: 'October 8–22, 2026', event: 'Fee payment with late fee of Rs. 500/week', type: 'deadline' },
      { date: 'October 12, 2026', event: 'Last date for National Merit Scholarship application', type: 'deadline' },
      { date: 'October 22, 2026', event: 'Absolute last date for fee payment — de-registration after this', type: 'deadline' }
    ],
    tasks: [
      {
        id: 't2_1',
        description: 'Pay Semester II fees online (portal.college.edu) or at accounts office by October 1 to avoid late penalty',
        deadline: 'October 1, 2026',
        deadlineISO: '2026-10-01',
        priority: 'CRITICAL',
        importance: 'Missing this date incurs Rs. 500/week late fee. Missing October 22 causes de-registration and loss of exam eligibility.',
        excerpt: 'Last date to submit annual fees (Semester II) without penalty: October 1, 2026. Students who fail to pay fees by October 22, 2026 will be de-registered.',
        affectedGroups: ['2nd year', '3rd year', '4th year', 'btec', 'mtech'],
        applicability: 'certain'
      },
      {
        id: 't2_2',
        description: 'Apply for National Merit Scholarship if CGPA ≥ 8.0 and family income < Rs. 8 lakh/annum',
        deadline: 'October 12, 2026',
        deadlineISO: '2026-10-12',
        priority: 'HIGH',
        importance: 'Incomplete or late applications are rejected without notice. Requires income certificate, marksheet, and bank details.',
        excerpt: 'Eligibility: Minimum CGPA of 8.0 in the previous semester, family income below Rs. 8 lakh per annum. Last date to submit application form: October 12, 2026.',
        affectedGroups: ['2nd year', '3rd year', '4th year', 'btec', 'mtech'],
        applicability: 'uncertain'
      },
      {
        id: 't2_3',
        description: 'Apply for Sports Scholarship if you have represented at National/State level sports',
        deadline: 'October 7, 2026',
        deadlineISO: '2026-10-07',
        priority: 'HIGH',
        importance: 'Deadline is earlier than the Merit Scholarship — apply at the Sports Department office.',
        excerpt: 'Applications are invited for sports scholarships for students who have represented at National/State level. Last date: October 7, 2026.',
        affectedGroups: ['all', '2nd year', '3rd year', '4th year'],
        applicability: 'uncertain'
      },
      {
        id: 't2_4',
        description: 'Gather documents for scholarship application: income certificate, marksheet, caste certificate (if applicable), bank details',
        deadline: 'October 12, 2026',
        deadlineISO: '2026-10-12',
        priority: 'MEDIUM',
        importance: 'Incomplete applications are rejected without notice. Documents must be ready before the deadline.',
        excerpt: 'Documents required: Income certificate, previous semester marksheet, caste certificate (if applicable), bank account details. Incomplete applications will be rejected without notice.',
        affectedGroups: ['2nd year', '3rd year', '4th year', 'btec', 'mtech'],
        applicability: 'uncertain'
      }
    ]
  },

  sample_3: {
    title: 'Industrial Training / Internship Guidelines — 3rd Year B.Tech',
    summary: 'The T&P Cell mandates a 4-week industrial training for all 3rd year B.Tech students during winter break (Dec 20, 2026 – Jan 17, 2027). Multiple sequential deadlines apply: portal registration by Nov 10, company confirmation letter by Nov 15, and report submission by Jan 31, 2027.',
    whoAffected: 'All 3rd year B.Tech students across all departments. Students already placed through campus placement drives are exempted but must submit proof by November 15.',
    changes: 'Industrial training guidelines and deadlines announced for winter break 2026-27.',
    importantDates: [
      { date: 'October 10, 2026',   event: 'Register T&P Cell placement preference (for those wanting facilitated placement)', type: 'deadline' },
      { date: 'November 10, 2026',  event: 'Online registration on training portal', type: 'deadline' },
      { date: 'November 15, 2026',  event: 'Submit company confirmation letter to T&P Cell', type: 'deadline' },
      { date: 'Dec 20, 2026 – Jan 17, 2027', event: 'Industrial Training Period', type: 'informational' },
      { date: 'January 31, 2027',   event: 'Internship Report submission', type: 'deadline' },
      { date: 'First week of Feb 2027', event: 'Presentation/Viva (exact dates TBD)', type: 'deadline' }
    ],
    tasks: [
      {
        id: 't3_1',
        description: 'Register preference for T&P Cell facilitated company placement (if needed) by October 10, 2026',
        deadline: 'October 10, 2026',
        deadlineISO: '2026-10-10',
        priority: 'HIGH',
        importance: 'This is the only way to get T&P Cell help finding a company. Missing this means you must arrange your own internship.',
        excerpt: 'To avail T&P Cell placement, register your preference by October 10, 2026.',
        affectedGroups: ['3rd year', 'third year'],
        applicability: 'certain'
      },
      {
        id: 't3_2',
        description: 'Complete online registration on the college training portal (training.college.edu) by November 10, 2026',
        deadline: 'November 10, 2026',
        deadlineISO: '2026-11-10',
        priority: 'HIGH',
        importance: 'Mandatory registration step that must precede submitting the company confirmation letter.',
        excerpt: 'Online registration on the college training portal (training.college.edu) must be completed by: November 10, 2026.',
        affectedGroups: ['3rd year', 'third year'],
        applicability: 'certain'
      },
      {
        id: 't3_3',
        description: 'Submit company confirmation letter (or campus placement proof) to T&P Cell by November 15, 2026',
        deadline: 'November 15, 2026',
        deadlineISO: '2026-11-15',
        priority: 'CRITICAL',
        importance: 'Failure to submit results in a FAIL grade in IT-601 (core subject), which cannot be compensated.',
        excerpt: 'Company confirmation letter must be submitted to the Training & Placement Cell by: November 15, 2026. Failure to submit by this date will result in the student being awarded a FAIL grade in the Industrial Training subject (IT-601).',
        affectedGroups: ['3rd year', 'third year'],
        applicability: 'certain'
      },
      {
        id: 't3_4',
        description: 'Complete 4-week industrial training during winter break (December 20, 2026 – January 17, 2027)',
        deadline: 'January 17, 2027',
        deadlineISO: '2027-01-17',
        priority: 'HIGH',
        importance: 'Mandatory curriculum requirement. Training forms the basis for the report and viva.',
        excerpt: 'Industrial Training of 4 weeks is mandatory as per the curriculum. The training must be completed during the winter break (December 20, 2026 to January 17, 2027).',
        affectedGroups: ['3rd year', 'third year'],
        applicability: 'certain'
      },
      {
        id: 't3_5',
        description: 'Submit Internship Report by January 31, 2027',
        deadline: 'January 31, 2027',
        deadlineISO: '2027-01-31',
        priority: 'HIGH',
        importance: 'Report must be submitted within 2 weeks of completing training. Required for evaluation.',
        excerpt: 'Internship Report must be submitted within 2 weeks of completing training: by January 31, 2027.',
        affectedGroups: ['3rd year', 'third year'],
        applicability: 'certain'
      },
      {
        id: 't3_6',
        description: 'Attend Presentation/Viva in first week of February 2027 (exact dates TBD)',
        deadline: 'First week of February 2027 (exact date not specified)',
        deadlineISO: '2027-02-07',
        priority: 'MEDIUM',
        importance: 'Final evaluation component. Exact dates to be announced separately.',
        excerpt: 'Presentation/viva will be held in the first week of February 2027. Exact dates will be announced later.',
        affectedGroups: ['3rd year', 'third year'],
        applicability: 'certain'
      }
    ]
  },

  sample_4: {
    title: 'Annual Cultural Festival UTSAV 2026 — Registration & Participation',
    summary: 'The Students\' Union announces UTSAV 2026, the annual cultural festival (November 14–16, 2026). All students can register for events online by October 25. Volunteer registration closes October 15. Students with 2+ active backlogs cannot win prize money but can participate.',
    whoAffected: 'All students of all years and departments. Hostel residents have an additional requirement for late-night permission slips. Students with 2+ backlogs are excluded from prize money.',
    changes: 'Annual cultural festival dates and registration procedures announced.',
    importantDates: [
      { date: 'October 15, 2026', event: 'Last date for volunteer registration', type: 'deadline' },
      { date: 'October 25, 2026', event: 'Last date for event registration (no on-spot registration)', type: 'deadline' },
      { date: 'November 10, 2026', event: 'Hostel residents: get late-night permission from warden', type: 'deadline' },
      { date: 'November 14–16, 2026', event: 'UTSAV 2026 Cultural Festival', type: 'informational' }
    ],
    tasks: [
      {
        id: 't4_1',
        description: 'Register for events at utsav.college.edu by October 25 — no on-spot registration available',
        deadline: 'October 25, 2026',
        deadlineISO: '2026-10-25',
        priority: 'MEDIUM',
        importance: 'On-the-spot registration will NOT be available. Missing this deadline means you cannot participate.',
        excerpt: 'All students wishing to participate in any event must register online at utsav.college.edu by October 25, 2026. On-the-spot registration will NOT be available.',
        affectedGroups: ['all', 'all years', 'all departments'],
        applicability: 'certain'
      },
      {
        id: 't4_2',
        description: 'Register as a volunteer for the organizing committee by October 15, 2026',
        deadline: 'October 15, 2026',
        deadlineISO: '2026-10-15',
        priority: 'LOW',
        importance: 'Optional — for students interested in helping organize the festival.',
        excerpt: 'Students interested in volunteering for the organizing committee should fill out the volunteer form by October 15, 2026.',
        affectedGroups: ['all'],
        applicability: 'certain'
      },
      {
        id: 't4_3',
        description: 'Hostel residents: Obtain late-night permission slip from hostel warden by November 10, 2026',
        deadline: 'November 10, 2026',
        deadlineISO: '2026-11-10',
        priority: 'MEDIUM',
        importance: 'Required for hostel residents attending events after 10 PM on November 14-15.',
        excerpt: 'Permission slips for late-night return (after 10 PM on November 14-15) must be obtained from your hostel warden by November 10, 2026.',
        affectedGroups: ['hostel', 'hostel residents'],
        applicability: 'uncertain'
      },
      {
        id: 't4_4',
        description: 'Verify backlog status — students with 2+ active backlogs are ineligible for prize money',
        deadline: 'Before October 25, 2026',
        deadlineISO: '2026-10-25',
        priority: 'LOW',
        importance: 'Students with 2+ active backlogs may participate but cannot win prizes. Confirm eligibility before registering for competitive events.',
        excerpt: 'Note: Students with active backlogs (more than 2 subjects) are not eligible for prize money but may still participate.',
        affectedGroups: ['all'],
        applicability: 'uncertain'
      }
    ]
  }
};

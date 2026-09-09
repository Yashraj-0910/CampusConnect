const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

const {
  sequelize,
  User,
  Student,
  Club,
  ClubCoordinator,
  ClubMember,
  Event,
  Announcement,
  FAQ,
  Mentor,
  StudentInterest
} = require('../models');

async function ensureDatabaseExists() {
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL detected. Skipping auto database creation check...');
    return;
  }
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'postgres',
    database: 'postgres' // Connect to default DB first
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME || 'campus_compass';
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error ensuring database exists:', err);
  } finally {
    await client.end();
  }
}

async function seed() {
  try {
    await ensureDatabaseExists();

    console.log('Synchronizing database models...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // 1. Create Hashed Passwords
    const studentPassword = await bcrypt.hash('studentpassword', 10);
    const coordinatorPassword = await bcrypt.hash('coordinatorpassword', 10);
    const adminPassword = await bcrypt.hash('adminpassword', 10);
    const mentorPassword = await bcrypt.hash('mentorpassword', 10);

    console.log('Creating users...');
    const users = await User.bulkCreate([
      { name: 'Jane Student', email: 'student@campuscompass.edu', password_hash: studentPassword, role: 'student' },
      { name: 'Alex Coordinator', email: 'coordinator@campuscompass.edu', password_hash: coordinatorPassword, role: 'coordinator' },
      { name: 'Admin User', email: 'admin@campuscompass.edu', password_hash: adminPassword, role: 'admin' },
      // Mentors
      { name: 'Siddharth Sharma', email: 'siddharth@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Priya Patel', email: 'priya@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Aarav Mehta', email: 'aarav@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Ananya Iyer', email: 'ananya@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Rohan Deshmukh', email: 'rohan@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Neha Gupta', email: 'neha@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Vikram Singh', email: 'vikram@campuscompass.edu', password_hash: mentorPassword, role: 'student' },
      { name: 'Kriti Verma', email: 'kriti@campuscompass.edu', password_hash: mentorPassword, role: 'student' }
    ], { returning: true });

    // Extract users
    const studentUser = users[0];
    const coordinatorUser = users[1];
    const adminUser = users[2];
    const mentorUsers = users.slice(3);

    console.log('Creating Student profiles...');
    const janeProfile = await Student.create({
      user_id: studentUser.id,
      student_id_card: 'STU2026001',
      department: 'Computer Science',
      year: 1,
      division: 'A',
      bio: 'First year CS student looking to explore programming and robotics clubs!',
      skills: 'Python, Basic HTML, Logic Building',
      availability: 'Weekdays after 4 PM'
    });

    // Seed student interests for Jane
    await StudentInterest.bulkCreate([
      { student_id: janeProfile.id, interest: 'Coding' },
      { student_id: janeProfile.id, interest: 'AI/ML' },
      { student_id: janeProfile.id, interest: 'Robotics' }
    ]);

    // Create student profiles for mentors
    const mentorProfiles = [];
    const depts = ['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Electronics', 'Computer Science', 'Information Technology', 'Electrical Engineering', 'Design'];
    const bios = [
      'Senior web developer and open source contributor. Hit me up for React/Node advice.',
      'AI enthusiast. Doing research in machine learning. Happy to guide beginners.',
      'Robotics club core lead. Expert in Arduino and embedded systems.',
      'President of Literary and Debate club. Experienced in public speaking and writing.',
      'Lead guitarist in Music club. Let\'s talk about jams and compositions.',
      'Choreographer in Dance club. Can help you balance academic with art.',
      'Captain of the Sports club, specializing in Basketball and Fitness.',
      'Freelance UI/UX designer. Ready to review your design portfolios.'
    ];
    for (let i = 0; i < mentorUsers.length; i++) {
      const prof = await Student.create({
        user_id: mentorUsers[i].id,
        student_id_card: `STU202401${i}`,
        department: depts[i],
        year: 3,
        division: 'B',
        bio: bios[i],
        skills: 'Mentorship, Leadership, Technical expertise',
        availability: 'Weekends'
      });
      mentorProfiles.push(prof);
    }

    console.log('Creating Clubs...');
    const clubs = await Club.bulkCreate([
      {
        name: 'Coding Club',
        category: 'technical',
        description: 'The ultimate hub for developers, competitive programmers, and open-source contributors.',
        about: 'Coding Club is a student-run organization dedicated to fostering a community of passionate developers. We host regular hackathons, coding contests, and workshops on modern technologies.',
        activities: 'Weekly coding meetups, DSA preparation sessions, Web development bootcamps, and Open Source contributions.',
        eligibility: 'Open to all years and departments. No prior coding experience required.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Online Coding Quiz -> Short Interview -> Membership',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        max_members: 150,
        logo_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=150',
        banner_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
      },
      {
        name: 'AI/ML Club',
        category: 'technical',
        description: 'Exploring the frontiers of Artificial Intelligence, Machine Learning, and Data Science.',
        about: 'The AI/ML Club introduces students to cutting-edge AI technologies. We work on machine learning models, neural networks, and computer vision projects.',
        activities: 'Kaggle competition meetups, Paper review sessions, AI model workshops, and guest lectures.',
        eligibility: 'Basic knowledge of Python is recommended, but beginners are welcome to attend beginner tracks.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Interview based on Python and Math -> Membership',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        max_members: 100,
        logo_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=150',
        banner_url: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800'
      },
      {
        name: 'Robotics Club',
        category: 'technical',
        description: 'Designing, building, and programming intelligent robots and autonomous systems.',
        about: 'Robotics Club is for students who love hardware, microcontrollers, IoT, and mechanical engineering. We build bots for international contests.',
        activities: 'Robot battles, Embedded C workshops, CAD modeling classes, and 3D printing sessions.',
        eligibility: 'Open to all departments. Enthusiasts of electronics, mechanics, or coding are welcome.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Hands-on Hardware Task -> Membership',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        max_members: 80,
        logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150',
        banner_url: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800'
      },
      {
        name: 'Dance Club',
        category: 'cultural',
        description: 'Expressing rhythm, grace, and passion through contemporary, hip-hop, and classical dance.',
        about: 'The Dance Club brings together dancers from various styles. We perform in college festivals, national level inter-collegiate dance events, and showcase routines.',
        activities: 'Daily dance routines, annual performance preparation, style workshops, and choreographic labs.',
        eligibility: 'Audition required. Passion for dance is a must!',
        beginners_allowed: false,
        recruitment_process: 'Registration -> Video Submission -> Live Audition Round -> Selection',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        max_members: 40,
        logo_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150',
        banner_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'
      },
      {
        name: 'Music Club',
        category: 'cultural',
        description: 'Creating melodies, writing lyrics, and performing vocals and instrumentals.',
        about: 'Music Club is the place for singers, guitarists, pianists, drummers, and songwriters. We record covers, perform live, and host campus jam sessions.',
        activities: 'Weekly jam rooms, open mic nights, instrumental training, and studio recording sessions.',
        eligibility: 'Open to vocalists and instrumentalists. Auditions required.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Audition Jam -> Selection',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        max_members: 60,
        logo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150',
        banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
      },
      {
        name: 'Drama Club',
        category: 'cultural',
        description: 'Bringing stories to life through theater, street plays (Nukkad Natak), and mime.',
        about: 'Drama Club trains students in acting, scriptwriting, stage management, and directing. We are known for our street plays raising awareness on social issues.',
        activities: 'Acting exercises, script discussions, street plays, and stage plays.',
        eligibility: 'All students interested in acting, writing, or crew work.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Monologue Audition / Crew Interview -> Selection',
        registration_status: 'closed',
        logo_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=150',
        banner_url: 'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=800'
      },
      {
        name: 'Photography Club',
        category: 'cultural',
        description: 'Capturing stories, colors, and memories through the camera lens.',
        about: 'Photography Club is a community of visual storytellers, street photographers, and editors. We cover all official campus events.',
        activities: 'Photowalks, lightroom editing workshops, composition theory, and campus gallery exhibitions.',
        eligibility: 'A camera is NOT required; smartphones are welcome. A passion for photography is.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Portfolio Review (3 photos) -> Membership',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        max_members: 75,
        logo_url: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=150',
        banner_url: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?w=800'
      },
      {
        name: 'Literary Club',
        category: 'literary',
        description: 'Unleashing creative writing, poetry slams, book reviews, and editorial activities.',
        about: 'Literary Club is for bookworms, poets, essayists, and storytellers. We publish the quarterly campus magazine.',
        activities: 'Creative writing workshops, poetry slams, book discussions, and editing sessions.',
        eligibility: 'Anyone who loves writing or reading.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Writing Prompt Submission -> Membership',
        registration_status: 'closed',
        logo_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150',
        banner_url: 'https://images.unsplash.com/photo-1474932430478-367db26836c1?w=800'
      },
      {
        name: 'Debate Club',
        category: 'literary',
        description: 'Polishing articulation, critical thinking, and public speaking through debates.',
        about: 'Debate Club prepares students for national and international Model United Nations (MUNs) and parliamentary debates.',
        activities: 'Mock debates, logic formatting workshops, current affairs sessions, and MUN training.',
        eligibility: 'Enthusiasts of public speaking, argumentation, and politics.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Extempore Round -> Selection',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        max_members: 50,
        logo_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=150',
        banner_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
      },
      {
        name: 'Entrepreneurship Club',
        category: 'entrepreneurship',
        description: 'Fostering startups, startup pitch decks, case studies, and business mentorship.',
        about: 'E-Club inspires students to build companies. We work with incubator programs to help student-led startups get funding.',
        activities: 'Startup pitch contests, case study workshops, shark-tank style events, and business conferences.',
        eligibility: 'All students with a business idea or interest in marketing, operations, and finance.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Statement of Purpose review -> Membership',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        max_members: 120,
        logo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        banner_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
      },
      {
        name: 'Sports Club',
        category: 'sports',
        description: 'Organizing tournaments, athletics, and promoting a healthy lifestyle.',
        about: 'Sports Club manages cricket, football, basketball, badminton, table tennis, and chess teams of our college.',
        activities: 'Daily training drills, inter-college cups, fitness bootcamps, and yoga events.',
        eligibility: 'Active players of sports. Tryouts required.',
        beginners_allowed: true,
        recruitment_process: 'Registration -> Physical fitness tryouts -> Selection',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        max_members: 100,
        logo_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150',
        banner_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
      },
      {
        name: 'NSS',
        category: 'social',
        description: 'National Service Scheme. Dedicated to community service and social welfare.',
        about: 'NSS involves students in social works, blood donation camps, cleaning drives, and visiting rural areas for developmental work.',
        activities: 'Blood donation, tree plantation, tutoring kids, rural camp, and cloth donation drives.',
        eligibility: 'All service-minded students can join directly.',
        beginners_allowed: true,
        recruitment_process: 'Direct Selection upon registration',
        registration_status: 'open',
        registration_start: new Date(),
        registration_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        max_members: 200,
        logo_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150',
        banner_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'
      }
    ], { returning: true });

    const codingClub = clubs[0];
    const aiClub = clubs[1];
    const roboticsClub = clubs[2];

    // Assign Alex Coordinator to Coding Club
    await ClubCoordinator.create({
      user_id: coordinatorUser.id,
      club_id: codingClub.id,
      role_title: 'Head Coordinator'
    });

    console.log('Creating Senior Mentors...');
    const mentorSubjects = ['Fullstack Development', 'Machine Learning & NLP', 'Robotics & Hardware', 'Creative Writing & Oratory', 'Classical and Rock Music', 'Hip Hop / Salsa Dance', 'Athletics & Sports Strategy', 'UI/UX Design Systems'];
    const mentorClubsArr = ['Coding Club', 'AI/ML Club', 'Robotics Club', 'Literary Club', 'Music Club', 'Dance Club', 'Sports Club', 'Coding Club (Design Lead)'];
    for (let i = 0; i < mentorUsers.length; i++) {
      await Mentor.create({
        user_id: mentorUsers[i].id,
        department: depts[i],
        year: 3,
        interests: mentorSubjects[i],
        experience: `Experienced student lead in the domain. Mentored 20+ juniors last year.`,
        clubs: mentorClubsArr[i],
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentorUsers[i].name.replace(' ', '')}`
      });
    }

    console.log('Creating Events...');
    const events = await Event.bulkCreate([
      {
        title: 'Annual Hackathon 2026',
        description: 'A 36-hour sprint to build innovative tech products addressing real-world challenges.',
        rules: 'Teams of 2-4 members. Code must be written during the hackathon. Use of APIs is allowed.',
        eligibility: 'All students of Campus, across all departments.',
        schedule: 'Day 1 9:00 AM: Orientation, Day 1 10:00 AM: Hacking Begins, Day 2 10:00 PM: Hacking Ends, Day 3: Pitching & Results',
        prizes: 'First Prize: $1000, Second Prize: $500, Best Beginner Team: $200',
        organizers: 'Coding Club Core Team',
        venue: 'Main Seminar Hall & Labs',
        event_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        registration_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        max_participants: 200,
        status: 'upcoming',
        cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        club_id: codingClub.id
      },
      {
        title: 'Introduction to Web Dev',
        description: 'Learn the basics of HTML, CSS, JavaScript, and start your frontend development journey.',
        rules: 'Bring your own laptop. Install VS Code beforehand.',
        eligibility: 'Specially designed for first-year beginners.',
        schedule: 'Saturday 2:00 PM to 5:00 PM',
        prizes: 'Participation Certificates & Sticker packs',
        organizers: 'Coding Club Frontend Team',
        venue: 'Lab 3, CS Department',
        event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        registration_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        max_participants: 60,
        status: 'upcoming',
        cover_image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
        club_id: codingClub.id
      },
      {
        title: 'Kaggle Bootcamp: House Price Prediction',
        description: 'A hands-on workshop guiding you through your first Regression model submission.',
        rules: 'Basic Python knowledge required.',
        eligibility: 'Open to all. Best suited for second and first years.',
        schedule: 'Sunday 11:00 AM to 1:00 PM',
        prizes: 'Top scorer on private leaderboard wins special merchandise.',
        organizers: 'AI/ML Club Data Science division',
        venue: 'Online on Zoom',
        event_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        max_participants: 100,
        status: 'upcoming',
        cover_image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800',
        club_id: aiClub.id
      },
      {
        title: 'RoboWars 2026',
        description: 'Watch wired and wireless custom robots battle out in an iron-clad arena.',
        rules: 'Robot weight limit: 15kg. No active flames or explosives allowed.',
        eligibility: 'Registered teams of maximum 5 members.',
        schedule: 'Arena entry: 9:00 AM, Round 1: 11:00 AM, Finals: 4:00 PM',
        prizes: 'First Prize: $1500, Runner up: $750',
        organizers: 'Robotics Club Core Team',
        venue: 'College Quadrangle',
        event_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        registration_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        max_participants: 40,
        status: 'upcoming',
        cover_image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
        club_id: roboticsClub.id
      },
      {
        title: 'Nukkad Natak Street Play Festival',
        description: 'Bringing forward critical issues like environmental awareness and digital safety.',
        rules: 'Time limit: 12 minutes per play. No electronic setups.',
        eligibility: 'Open to all collegiate theater groups.',
        schedule: 'Starting at 10:30 AM onwards',
        prizes: 'Best Play: Trophy + $300',
        organizers: 'Drama Club Committee',
        venue: 'Amphitheater',
        event_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        registration_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        max_participants: 15,
        status: 'upcoming',
        cover_image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
        club_id: clubs[5].id // Drama
      },
      // 10 more events to meet the 15+ requirement
      { title: 'Beat-Box Battle', description: 'Show your vocal beats.', venue: 'Student Center', event_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[4].id },
      { title: 'Dance Audition Round 1', description: 'Freshmen auditions.', venue: 'Yoga Room', event_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[3].id },
      { title: 'Macro Photography Walk', description: 'Excursion around campus.', venue: 'Botanical Garden', event_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[6].id },
      { title: 'Poetry Slam Night', description: 'Share your verses.', venue: 'Library lawn', event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[7].id },
      { title: 'Inter-Department Debate Cup', description: 'Speaking on global affairs.', venue: 'Seminar Hall 2', event_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[8].id },
      { title: 'Startup Pitch Session', description: 'Showcase ideas to VCs.', venue: 'Incubator Cell', event_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[9].id },
      { title: 'Inter-College Basketball Cup', description: 'Annual sports meet.', venue: 'Sports Arena', event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[10].id },
      { title: 'Blood Donation Camp 2026', description: 'Organized with Red Cross.', venue: 'Auditorium Lounge', event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), status: 'upcoming', club_id: clubs[11].id },
      { title: 'AI Ethics Debate Panel', description: 'Exploring machine consciousness.', venue: 'CS Seminar Hall', event_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed', club_id: aiClub.id },
      { title: 'Introduction to Arduino', description: 'Basic circuits hands-on.', venue: 'Robotics Lab', event_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), registration_deadline: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), status: 'completed', club_id: roboticsClub.id }
    ]);

    console.log('Creating Announcements...');
    await Announcement.bulkCreate([
      { title: 'Campus Compass Launched!', content: 'Welcome to the unified student life portal. Explore clubs, ask questions to mentors, and check roadmaps.', category: 'general', is_important: true },
      { title: 'Coding Club registrations are open!', content: 'Recruitment is now live for all freshers and sophomores. Fill the club application before the deadline.', category: 'club', is_important: true, club_id: codingClub.id },
      { title: 'Hackathon schedules published', content: 'Check the events section for detailed timelines, guidelines and rules for the 2026 Hackathon.', category: 'event', is_important: false, club_id: codingClub.id },
      { title: 'AI/ML Club hosts new Kaggle Boot camp', content: 'Register for the Sunday Kaggle session. Learn how to write algorithms and deploy models.', category: 'club', is_important: false, club_id: aiClub.id },
      { title: 'Blood Donation Drive tomorrow', content: 'NSS invites all students to participate in the noble cause. Join us in the Auditorium Lounge.', category: 'important', is_important: true, club_id: clubs[11].id },
      { title: 'National Web Design Opportunity', content: 'A national level design competition is open. Register using our opportunity link.', category: 'opportunity', is_important: false },
      { title: 'Dance Audition details updated', content: 'Video submission deadline extended. Check out Dance Club specifications page.', category: 'club', is_important: false, club_id: clubs[3].id },
      { title: 'Debate Club MUN schedule', content: 'Mock session on Saturday to prepare for Harvard MUN simulation.', category: 'club', is_important: false, club_id: clubs[8].id },
      { title: 'E-Club Pitch Deck template', content: 'Ready template shared in the Entrepreneurship resources tab.', category: 'club', is_important: false, club_id: clubs[9].id },
      { title: 'Sports Club Tryout instructions', content: 'Cricket and Football kit requirement details published.', category: 'club', is_important: false, club_id: clubs[10].id }
    ]);

    console.log('Creating FAQs...');
    await FAQ.bulkCreate([
      { question: 'Can first-year students join clubs?', answer: 'Yes. Most clubs welcome first-year students and have specific recruitment tracks tailored for them.', category: 'General' },
      { question: 'Do I need previous experience to join technical clubs?', answer: 'No. Many technical clubs like Coding and Robotics accept beginners and provide baseline bootcamps to train them.', category: 'Technical Clubs' },
      { question: 'Can I join multiple clubs?', answer: 'Yes, you can register for multiple clubs. However, check their schedules to ensure timing does not clash.', category: 'General' },
      { question: 'What happens after registering for a club?', answer: 'Depending on the club, there may be direct selection, an online quiz, an audition, or a short interview round.', category: 'Admissions' },
      { question: 'What is a core team role?', answer: 'Core team members are senior students who organize events, manage club finances, and handle administrative works.', category: 'Roles' },
      { question: 'How can I become a club coordinator?', answer: 'Club coordinators are selected by the college authorities and faculty based on leadership qualities, past contributions, and interviews.', category: 'Roles' },
      { question: 'Are auditions required for cultural clubs?', answer: 'Yes, most cultural clubs like Dance and Music require an audition to test performance baselines.', category: 'Cultural Clubs' },
      { question: 'What are the benefits of joining a club?', answer: 'It helps you build networks, learn industrial skills, get peer mentorship, and improve your resume for future careers.', category: 'General' },
      { question: 'How do I register for an event?', answer: 'Navigate to the events page, select the desired event, and click the Register button to log your participation details.', category: 'Events' },
      { question: 'Who can help me if I face issues?', answer: 'You can reach out to the Senior Mentors through the Mentor portal or ask questions directly to club coordinators.', category: 'Support' },
      { question: 'How is the club match percentage calculated?', answer: 'It matches your interests (e.g., Coding, Music) with the club tags and categories, giving you a custom score.', category: 'General' },
      { question: 'Can I leave a club after joining?', answer: 'Yes. You can contact your club coordinator to withdraw your active membership status.', category: 'Admissions' },
      { question: 'Is there a fee for joining clubs?', answer: 'No. Campus Compass and all listed college student clubs are entirely free to register and join.', category: 'General' },
      { question: 'What is a Model United Nations (MUN)?', answer: 'MUN is a debate competition simulating UN councils, organized by the Debate Club to improve international relations and speech skills.', category: 'Literary Clubs' },
      { question: 'Where do club workshops take place?', answer: 'Locations vary between CS labs, seminar halls, and online platforms. The venue is always specified on the event card.', category: 'Events' }
    ]);

    console.log('Seeding process complete! Database populated.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

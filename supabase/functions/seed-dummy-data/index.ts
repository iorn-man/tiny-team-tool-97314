import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== STARTING SEED DUMMY DATA ===')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Clear existing data (optional, but helps with clean testing)
    console.log('Clearing existing test data...')
    await supabaseAdmin.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Create Faculty Accounts
    console.log('Creating faculty accounts...')
    const facultyData = [
      {
        email: 'john.smith@faculty.edu',
        password: 'Faculty123!',
        fullName: 'Dr. John Smith',
        facultyId: 'FAC001',
        department: 'Computer Science'
      },
      {
        email: 'sarah.johnson@faculty.edu',
        password: 'Faculty123!',
        fullName: 'Prof. Sarah Johnson',
        facultyId: 'FAC002',
        department: 'Mathematics'
      },
      {
        email: 'michael.brown@faculty.edu',
        password: 'Faculty123!',
        fullName: 'Dr. Michael Brown',
        facultyId: 'FAC003',
        department: 'Physics'
      }
    ]

    const facultyIds: Record<string, string> = {}

    for (const faculty of facultyData) {
      console.log(`Creating faculty: ${faculty.email}`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: faculty.email,
        password: faculty.password,
        email_confirm: true,
        user_metadata: {
          full_name: faculty.fullName
        }
      })

      if (authError && !authError.message.includes('already been registered')) {
        throw authError
      }

      const userId = authData?.user?.id || (await supabaseAdmin.auth.admin.listUsers()).data.users?.find(u => u.email === faculty.email)?.id

      if (!userId) throw new Error(`Failed to get user ID for ${faculty.email}`)

      // Assign faculty role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: userId,
        role: 'faculty'
      }, { onConflict: 'user_id,role' })

      // Create faculty record
      const { data: facultyRecord } = await supabaseAdmin
        .from('faculties')
        .upsert({
          user_id: userId,
          faculty_id: faculty.facultyId,
          full_name: faculty.fullName,
          email: faculty.email,
          password: faculty.password,
          department: faculty.department,
          status: 'active'
        }, { onConflict: 'faculty_id' })
        .select()
        .single()

      facultyIds[faculty.facultyId] = facultyRecord?.id || userId
      console.log(`✓ Created faculty: ${faculty.email}`)
    }

    // Create Courses
    console.log('Creating courses...')
    const coursesData = [
      {
        course_code: 'CS101',
        course_name: 'Introduction to Programming',
        credits: 4,
        department: 'Computer Science',
        semester: 1,
        description: 'Basic programming concepts and Python',
        faculty_id: facultyIds['FAC001']
      },
      {
        course_code: 'MATH201',
        course_name: 'Calculus II',
        credits: 4,
        department: 'Mathematics',
        semester: 2,
        description: 'Advanced calculus and applications',
        faculty_id: facultyIds['FAC002']
      },
      {
        course_code: 'PHY101',
        course_name: 'General Physics',
        credits: 3,
        department: 'Physics',
        semester: 1,
        description: 'Fundamental physics principles',
        faculty_id: facultyIds['FAC003']
      },
      {
        course_code: 'CS202',
        course_name: 'Data Structures',
        credits: 4,
        department: 'Computer Science',
        semester: 2,
        description: 'Advanced data structures and algorithms',
        faculty_id: facultyIds['FAC001']
      }
    ]

    const { data: courses } = await supabaseAdmin
      .from('courses')
      .upsert(coursesData, { onConflict: 'course_code' })
      .select()

    console.log(`✓ Created ${courses?.length} courses`)

    // Create Student Accounts
    console.log('Creating student accounts...')
    const studentsData = [
      {
        email: 'alice.williams@student.edu',
        password: 'Student123!',
        fullName: 'Alice Williams',
        studentId: 'STU001',
        dateOfBirth: '2003-05-15',
        gender: 'Female'
      },
      {
        email: 'bob.martinez@student.edu',
        password: 'Student123!',
        fullName: 'Bob Martinez',
        studentId: 'STU002',
        dateOfBirth: '2002-08-22',
        gender: 'Male'
      },
      {
        email: 'carol.davis@student.edu',
        password: 'Student123!',
        fullName: 'Carol Davis',
        studentId: 'STU003',
        dateOfBirth: '2003-11-30',
        gender: 'Female'
      },
      {
        email: 'david.wilson@student.edu',
        password: 'Student123!',
        fullName: 'David Wilson',
        studentId: 'STU004',
        dateOfBirth: '2002-03-10',
        gender: 'Male'
      },
      {
        email: 'emma.taylor@student.edu',
        password: 'Student123!',
        fullName: 'Emma Taylor',
        studentId: 'STU005',
        dateOfBirth: '2003-07-18',
        gender: 'Female'
      }
    ]

    const studentIds: Record<string, string> = {}

    for (const student of studentsData) {
      console.log(`Creating student: ${student.email}`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: student.email,
        password: student.password,
        email_confirm: true,
        user_metadata: {
          full_name: student.fullName
        }
      })

      if (authError && !authError.message.includes('already been registered')) {
        throw authError
      }

      const userId = authData?.user?.id || (await supabaseAdmin.auth.admin.listUsers()).data.users?.find(u => u.email === student.email)?.id

      if (!userId) throw new Error(`Failed to get user ID for ${student.email}`)

      // Assign student role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: userId,
        role: 'student'
      }, { onConflict: 'user_id,role' })

      // Create student record
      const { data: studentRecord } = await supabaseAdmin
        .from('students')
        .upsert({
          user_id: userId,
          student_id: student.studentId,
          full_name: student.fullName,
          email: student.email,
          password: student.password,
          date_of_birth: student.dateOfBirth,
          gender: student.gender,
          status: 'active'
        }, { onConflict: 'student_id' })
        .select()
        .single()

      studentIds[student.studentId] = studentRecord?.id || userId
      console.log(`✓ Created student: ${student.email}`)
    }

    // Create Enrollments
    console.log('Creating enrollments...')
    const enrollments = []
    if (courses) {
      // Enroll students in various courses
      enrollments.push(
        { student_id: studentIds['STU001'], course_id: courses[0].id, status: 'enrolled' },
        { student_id: studentIds['STU001'], course_id: courses[1].id, status: 'enrolled' },
        { student_id: studentIds['STU002'], course_id: courses[0].id, status: 'enrolled' },
        { student_id: studentIds['STU002'], course_id: courses[2].id, status: 'enrolled' },
        { student_id: studentIds['STU003'], course_id: courses[1].id, status: 'enrolled' },
        { student_id: studentIds['STU003'], course_id: courses[3].id, status: 'enrolled' },
        { student_id: studentIds['STU004'], course_id: courses[0].id, status: 'enrolled' },
        { student_id: studentIds['STU004'], course_id: courses[2].id, status: 'enrolled' },
        { student_id: studentIds['STU005'], course_id: courses[3].id, status: 'enrolled' }
      )

      await supabaseAdmin.from('enrollments').insert(enrollments)
      console.log(`✓ Created ${enrollments.length} enrollments`)
    }

    // Create some grades
    console.log('Creating sample grades...')
    if (courses) {
      const grades = [
        {
          student_id: studentIds['STU001'],
          course_id: courses[0].id,
          assessment_type: 'Midterm',
          assessment_name: 'Midterm Exam',
          max_marks: 100,
          obtained_marks: 85,
          grade_letter: 'A'
        },
        {
          student_id: studentIds['STU002'],
          course_id: courses[0].id,
          assessment_type: 'Midterm',
          assessment_name: 'Midterm Exam',
          max_marks: 100,
          obtained_marks: 78,
          grade_letter: 'B'
        }
      ]

      await supabaseAdmin.from('grades').insert(grades)
      console.log(`✓ Created ${grades.length} grade records`)
    }

    // Create attendance records
    console.log('Creating attendance records...')
    if (courses) {
      const attendance = [
        {
          student_id: studentIds['STU001'],
          course_id: courses[0].id,
          date: '2025-11-15',
          status: 'present'
        },
        {
          student_id: studentIds['STU001'],
          course_id: courses[0].id,
          date: '2025-11-16',
          status: 'present'
        },
        {
          student_id: studentIds['STU002'],
          course_id: courses[0].id,
          date: '2025-11-15',
          status: 'absent'
        }
      ]

      await supabaseAdmin.from('attendance').insert(attendance)
      console.log(`✓ Created ${attendance.length} attendance records`)
    }

    console.log('=== SEED COMPLETED SUCCESSFULLY ===')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Dummy data seeded successfully',
        credentials: {
          faculty: [
            { email: 'john.smith@faculty.edu', password: 'Faculty123!' },
            { email: 'sarah.johnson@faculty.edu', password: 'Faculty123!' },
            { email: 'michael.brown@faculty.edu', password: 'Faculty123!' }
          ],
          students: [
            { email: 'alice.williams@student.edu', password: 'Student123!' },
            { email: 'bob.martinez@student.edu', password: 'Student123!' },
            { email: 'carol.davis@student.edu', password: 'Student123!' },
            { email: 'david.wilson@student.edu', password: 'Student123!' },
            { email: 'emma.taylor@student.edu', password: 'Student123!' }
          ]
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('=== SEED ERROR ===')
    console.error('Error details:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

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
    console.log('=== CREATE USER FUNCTION CALLED ===')
    
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

    const requestBody = await req.json()
    console.log('Request body:', JSON.stringify(requestBody))
    
    const { email, password, fullName, role, recordId } = requestBody

    if (!email || !password || !fullName || !role || !recordId) {
      throw new Error('Missing required fields')
    }

    let userId: string

    // Check if user already exists
    console.log(`Checking if user exists with email: ${email}`)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      // User already exists, use their ID
      userId = existingUser.id
      console.log(`User already exists with email ${email}, using existing user ID: ${userId}`)
    } else {
      // Create new user with admin API (bypasses signup restrictions)
      console.log(`Creating new user with email: ${email}`)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      userId = authData.user.id
      console.log(`Created new user with email ${email}, user ID: ${userId}`)
    }

    // Check if role already exists for this user
    console.log(`Checking existing roles for user ${userId}`)
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle()

    if (roleCheckError) {
      console.error('Role check error:', roleCheckError)
    }

    // Assign role to user only if it doesn't exist
    if (!existingRole) {
      console.log(`Assigning ${role} role to user ${userId}`)
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        })

      if (roleError) {
        console.error('Role assignment error:', roleError)
        throw roleError
      }
      console.log(`Successfully assigned ${role} role to user ${userId}`)
    } else {
      console.log(`User ${userId} already has ${role} role`)
    }

    // Update the student/faculty record with user_id
    const tableName = role === 'student' ? 'students' : 'faculties'
    console.log(`Updating ${tableName} record ${recordId} with user_id ${userId}`)
    const { error: updateError } = await supabaseAdmin
      .from(tableName)
      .update({ user_id: userId })
      .eq('id', recordId)

    if (updateError) {
      console.error('Record update error:', updateError)
      throw updateError
    }
    console.log(`Successfully updated ${tableName} record ${recordId} with user_id ${userId}`)

    console.log('=== CREATE USER FUNCTION COMPLETED SUCCESSFULLY ===')
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userId,
        message: existingUser ? 'Linked to existing user account' : 'Created new user account'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('=== CREATE USER FUNCTION ERROR ===')
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

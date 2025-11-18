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

    const { email, password, fullName, role, recordId } = await req.json()

    let userId: string

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      // User already exists, use their ID
      userId = existingUser.id
      console.log(`User already exists with email ${email}, using existing user ID: ${userId}`)
    } else {
      // Create new user with admin API (bypasses signup restrictions)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName
        }
      })

      if (authError) {
        throw authError
      }

      userId = authData.user.id
      console.log(`Created new user with email ${email}, user ID: ${userId}`)
    }

    // Check if role already exists for this user
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .single()

    // Assign role to user only if it doesn't exist
    if (!existingRole) {
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
      console.log(`Assigned ${role} role to user ${userId}`)
    } else {
      console.log(`User ${userId} already has ${role} role`)
    }

    // Update the student/faculty record with user_id
    const tableName = role === 'student' ? 'students' : 'faculties'
    const { error: updateError } = await supabaseAdmin
      .from(tableName)
      .update({ user_id: userId })
      .eq('id', recordId)

    if (updateError) {
      console.error('Record update error:', updateError)
      throw updateError
    }
    console.log(`Updated ${tableName} record ${recordId} with user_id ${userId}`)

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

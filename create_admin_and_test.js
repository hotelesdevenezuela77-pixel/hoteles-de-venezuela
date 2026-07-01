import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghgetcznlrilgocwigmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const adminEmail = 'hotelesdevenezuela77@gmail.com';
const adminPassword = 'admin2027';

async function test() {
  console.log("1. Attempting to sign in with admin credentials...");
  let authRes = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });

  if (authRes.error) {
    console.log("Sign in failed. Attempting to register the admin user...");
    const signUpRes = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: "Administrador Oficial",
          role: "admin"
        }
      }
    });

    if (signUpRes.error) {
      console.error("Sign up failed:", signUpRes.error);
      return;
    }

    console.log("Sign up succeeded! Signing in now...");
    authRes = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (authRes.error) {
      console.error("Sign in after sign up failed:", authRes.error);
      return;
    }
  }

  console.log("Logged in successfully! User ID:", authRes.data.user.id);

  // Now, create the user profile to ensure they are marked as admin in the DB
  const profile = {
    user_id: authRes.data.user.id,
    email: adminEmail,
    name: "Administrador Oficial",
    role: "admin"
  };

  console.log("Upserting admin user profile...");
  const profRes = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select();

  if (profRes.error) {
    console.error("Profile upsert failed:", profRes.error);
  } else {
    console.log("Profile upsert succeeded:", profRes.data);
  }

  // Now test category insertion
  console.log("Testing insert via authenticated admin client...");
  const sampleCategory = {
    id: 9999,
    slug: 'test-category-xyz',
    name: 'Test Category XYZ',
    icon: 'hotel'
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([sampleCategory])
    .select();

  if (error) {
    console.error("Insert failed even when authenticated:", error);
  } else {
    console.log("Insert succeeded!", data);
    
    // Clean up
    console.log("Cleaning up...");
    const { error: delError } = await supabase
      .from('categories')
      .delete()
      .eq('id', 9999);
    
    if (delError) {
      console.error("Clean up failed:", delError);
    } else {
      console.log("Clean up succeeded!");
    }
  }
}

test();

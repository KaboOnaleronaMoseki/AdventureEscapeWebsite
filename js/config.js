// Configuration for Supabase and EmailJS
window.ADVENTURE_CONFIG = {
  supabase: {
    url: "https://vbuofcixspsunelpajhy.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidW9mY2l4c3BzdW5lbHBhamh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NTMzMDcsImV4cCI6MjEwOTMyOTMwN30.GvN5Z-SA90uj6b_U1bSgAuYKKvPB8x_vD_oRO7ET8Yk"
  },
  emailjs: {
    serviceId: "service_uz05v8s",
    templateId: "template_0awhcvu",
    publicKey: "wL4SZdb5JMNVwvwsU",
    recipientEmail: "Kaboonalerona7@gmail.com"
  }
};

/**
 * Returns a singleton instance of the Supabase client.
 */
function getSupabaseClient() {
  if (!window.supabase) {
    console.error("Supabase client library (@supabase/supabase-js) is not loaded.");
    return null;
  }
  const config = window.ADVENTURE_CONFIG?.supabase;
  if (!config || !config.url || !config.anonKey) {
    console.error("Supabase configuration is missing or incomplete.");
    return null;
  }
  if (!window._supabaseInstance) {
    window._supabaseInstance = window.supabase.createClient(config.url, config.anonKey);
  }
  return window._supabaseInstance;
}


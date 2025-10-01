import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const postSlug = url.searchParams.get('slug');

    if (!postSlug) {
      return new Response(
        JSON.stringify({ error: 'Post slug is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('post_views')
        .select('view_count')
        .eq('post_slug', postSlug)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ view_count: data?.view_count || 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      const { data: existingData } = await supabase
        .from('post_views')
        .select('view_count')
        .eq('post_slug', postSlug)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from('post_views')
          .update({ 
            view_count: existingData.view_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('post_slug', postSlug);

        if (error) throw error;

        return new Response(
          JSON.stringify({ view_count: existingData.view_count + 1 }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        const { error } = await supabase
          .from('post_views')
          .insert({ post_slug: postSlug, view_count: 1 });

        if (error) throw error;

        return new Response(
          JSON.stringify({ view_count: 1 }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
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
    const query = url.searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const searchTerm = query.trim();

    const { data, error } = await supabase
      .from('search_index')
      .select('post_slug, title, content, categories, created_at')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,categories.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    const results = (data || []).map(item => {
      let excerpt = '';
      const lowerContent = item.content.toLowerCase();
      const lowerQuery = searchTerm.toLowerCase();
      const index = lowerContent.indexOf(lowerQuery);
      
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(item.content.length, index + searchTerm.length + 100);
        excerpt = (start > 0 ? '...' : '') + 
                  item.content.substring(start, end) + 
                  (end < item.content.length ? '...' : '');
      } else {
        excerpt = item.content.substring(0, 150) + '...';
      }

      return {
        slug: item.post_slug,
        title: item.title,
        excerpt: excerpt,
        categories: item.categories,
        created_at: item.created_at,
      };
    });

    return new Response(
      JSON.stringify({ results }),
      {
        status: 200,
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

CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'rascunho',
  calc_method TEXT NOT NULL DEFAULT 'simple',
  weights JSONB,
  share_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.respondents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  organizational_unit TEXT,
  job_title TEXT,
  respondent_profile TEXT,
  submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  respondent_id UUID NOT NULL REFERENCES public.respondents(id) ON DELETE CASCADE,
  dimension_key TEXT NOT NULL,
  question_key TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (respondent_id, question_key)
);

CREATE TABLE public.evidences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  respondent_id UUID NOT NULL REFERENCES public.respondents(id) ON DELETE CASCADE,
  dimension_key TEXT NOT NULL,
  evidence_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (respondent_id, dimension_key)
);

CREATE TABLE public.campaign_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  total_respondents INTEGER,
  overall_score NUMERIC,
  overall_maturity_level INTEGER,
  consensus_index NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.respondents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.responses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidences TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_results TO anon, authenticated;
GRANT ALL ON public.organizations, public.campaigns, public.respondents, public.responses, public.evidences, public.campaign_results TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_respondents" ON public.respondents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_responses" ON public.responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_evidences" ON public.evidences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_campaign_results" ON public.campaign_results FOR ALL USING (true) WITH CHECK (true);

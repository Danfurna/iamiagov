ALTER TABLE public.respondents
  ADD COLUMN consent_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN consented_at TIMESTAMPTZ,
  ADD COLUMN consent_version TEXT;

COMMENT ON COLUMN public.respondents.consent_accepted IS 'Indica o aceite voluntário do participante para a pesquisa.';
COMMENT ON COLUMN public.respondents.consented_at IS 'Data e hora em que o consentimento foi registrado.';
COMMENT ON COLUMN public.respondents.consent_version IS 'Versão do texto de consentimento apresentado ao participante.';
// Camada de acesso a dados (Lovable Cloud) para o IAMIA-GOV.
import { supabase } from "@/integrations/supabase/client";
import { DIMENSIONS } from "./assessment";

export interface Organization {
  id: string;
  name: string;
  parent_body: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  calc_method: string;
  weights: Record<string, number> | null;
  share_token: string;
  created_at: string;
}

export interface Respondent {
  id: string;
  campaign_id: string;
  name: string;
  email: string | null;
  organizational_unit: string | null;
  job_title: string | null;
  respondent_profile: string | null;
  consent_accepted: boolean;
  consented_at: string | null;
  consent_version: string | null;
  submitted: boolean;
  created_at: string;
}

export interface ResponseRow {
  respondent_id: string;
  dimension_key: string;
  question_key: string;
  score: number;
}

// ---- Organizations ----
export async function listOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Organization[];
}

export async function createOrganization(input: { name: string; parent_body?: string }) {
  const { data, error } = await supabase.from("organizations").insert(input).select().single();
  if (error) throw error;
  return data as Organization;
}

export async function deleteOrganization(id: string) {
  const { error } = await supabase.from("organizations").delete().eq("id", id);
  if (error) throw error;
}

// ---- Campaigns ----
export async function listCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Campaign[];
}

export async function getCampaign(id: string): Promise<Campaign> {
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Campaign;
}

export async function getCampaignByToken(token: string): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("share_token", token)
    .single();
  if (error) throw error;
  return data as Campaign;
}

export async function createCampaign(input: Partial<Campaign> & { organization_id: string; name: string }) {
  const { data, error } = await supabase.from("campaigns").insert(input).select().single();
  if (error) throw error;
  return data as Campaign;
}

export async function updateCampaign(id: string, input: Partial<Campaign>) {
  const { data, error } = await supabase.from("campaigns").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Campaign;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

// ---- Respondents ----
export async function listRespondents(campaignId: string): Promise<Respondent[]> {
  const { data, error } = await supabase
    .from("respondents")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Respondent[];
}

export async function getRespondent(id: string): Promise<Respondent> {
  const { data, error } = await supabase.from("respondents").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Respondent;
}

export async function createRespondent(input: Partial<Respondent> & { campaign_id: string; name: string }) {
  const { data, error } = await supabase.from("respondents").insert(input).select().single();
  if (error) throw error;
  return data as Respondent;
}

export async function updateRespondent(id: string, input: Partial<Respondent>) {
  const { data, error } = await supabase.from("respondents").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Respondent;
}

export async function deleteRespondent(id: string) {
  const { error } = await supabase.from("respondents").delete().eq("id", id);
  if (error) throw error;
}

// ---- Responses ----
export async function listResponsesForCampaign(campaignId: string): Promise<ResponseRow[]> {
  const respondents = await listRespondents(campaignId);
  const ids = respondents.filter((r) => r.submitted).map((r) => r.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("responses")
    .select("respondent_id,dimension_key,question_key,score")
    .in("respondent_id", ids);
  if (error) throw error;
  return data as ResponseRow[];
}

export async function listResponsesForRespondent(respondentId: string): Promise<ResponseRow[]> {
  const { data, error } = await supabase
    .from("responses")
    .select("respondent_id,dimension_key,question_key,score")
    .eq("respondent_id", respondentId);
  if (error) throw error;
  return data as ResponseRow[];
}

// Salvamento automático de uma resposta (upsert por respondente+questão).
export async function upsertResponse(input: {
  respondent_id: string;
  dimension_key: string;
  question_key: string;
  score: number;
}) {
  const { error } = await supabase
    .from("responses")
    .upsert(input, { onConflict: "respondent_id,question_key" });
  if (error) throw error;
}

export async function upsertEvidence(input: {
  respondent_id: string;
  dimension_key: string;
  evidence_text: string;
}) {
  const { error } = await supabase
    .from("evidences")
    .upsert(input, { onConflict: "respondent_id,dimension_key" });
  if (error) throw error;
}

export async function listEvidences(respondentId: string) {
  const { data, error } = await supabase
    .from("evidences")
    .select("dimension_key,evidence_text")
    .eq("respondent_id", respondentId);
  if (error) throw error;
  return (data ?? []) as { dimension_key: string; evidence_text: string }[];
}

// Util — link compartilhável
export function shareLink(token: string) {
  if (typeof window === "undefined") return `/responder/${token}`;
  return `${window.location.origin}/responder/${token}`;
}

export { DIMENSIONS };

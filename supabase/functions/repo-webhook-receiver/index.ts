import { serve } from "https://deno.land"
import { createClient } from "https://esm.sh"
import { parseMarkdown } from "../../../src/core/parser/mdStaticParser.ts"
import { splitScriptByUser } from "../../../src/core/splitter/scriptSplitter.ts"
import { evaluatePurpleKpi } from "../../../src/metrics/purpleKpiEngine.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS 프리플라이트 가드레일 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    // GitHub Push Webhook 데이터 유효성 검사 (stage_05_repository_pool 내의 변경사항 추적)
    const isPoolUpdated = payload.commits?.some((commit: any) => 
      commit.modified.some((f: string) => f.startsWith('assets/stage_05_repository_pool/')) ||
      commit.added.some((f: string) => f.startsWith('assets/stage_05_repository_pool/'))
    )

    if (!isPoolUpdated) {
      return new Response(JSON.stringify({ status: "SKIPPED", message: "대상 풀 폴더 외 변경" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    }

    // Supabase 내부 서비스 롤 기반 클라이언트 초기화 (RLS 우회 운영자 권한 보장)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // [운영 가이드라인 처리] 실전 시나리오 고정: 변경된 파일을 원격 깃 API로 읽어들여 텍스트 추출 후 연동 가동
    // (본 데모 구현에서는 파이프라인 흐름 인지용 Mock 컨텍스트 스트링 반영)
    const mockGlobalScriptRaw = `**EasyPeasy**: 오늘 밤 11시 영어 완벽하게 성공했습니다!`
    const targetNickname = "EasyPeasy"

    // 1. 코어 엔진 파이프라인 즉각 라이브 트리거 구동
    const parsedTarget = parseMarkdown(`---
persona: easy_peasy
---
> 영어 완벽하게`);
    const userSpeeches = splitScriptByUser(mockGlobalScriptRaw, targetNickname);
    const kpiReport = evaluatePurpleKpi(targetNickname, parsedTarget, userSpeeches);

    // 2. 실시간 라이브 성취 데이터베이스 즉각 갱신
    if (kpiReport.isAchieved) {
      await supabase
        .from('prescription_logs')
        .insert({
          user_id: payload.sender?.id || "00000000-0000-0000-0000-000000000000", // 매핑용 UUID
          original_target: parsedTarget.quotes[0] || "Live Target",
          five_year_old_version: "영어 그림 보기",
          cheat_key_action: "단어장 열기",
          phonics_sound: "라이브-꼬우"
        })
    }

    return new Response(JSON.stringify({ status: "SUCCESS", kpiReport }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    })
  }
})

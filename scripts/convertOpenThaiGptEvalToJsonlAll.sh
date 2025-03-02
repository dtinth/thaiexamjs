#!/bin/bash -e

mkdir -p openthaigpt_eval

bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/08_onet_m3_thai.csv openthaigpt_eval/onet_m3_thai.jsonl thai
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/09_onet_m3_social.csv openthaigpt_eval/onet_m3_social.jsonl social
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/10_onet_m3_math.csv openthaigpt_eval/onet_m3_math.jsonl math
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/11_onet_m3_science.csv openthaigpt_eval/onet_m3_science.jsonl science
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/12_onet_m3_english.csv openthaigpt_eval/onet_m3_english.jsonl english

bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/13_onet_m6_thai.csv openthaigpt_eval/onet_m6_thai.jsonl thai
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/14_onet_m6_math.csv openthaigpt_eval/onet_m6_math.jsonl math
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/15_onet_m6_social.csv openthaigpt_eval/onet_m6_social.jsonl social
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/16_onet_m6_science.csv openthaigpt_eval/onet_m6_science.jsonl science
bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/17_onet_m6_english.csv openthaigpt_eval/onet_m6_english.jsonl english

echo "All conversions complete! Files are in the openthaigpt_eval directory."
ls -1 openthaigpt_eval/*.jsonl
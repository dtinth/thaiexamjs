import { evaluateQuestion } from "../src/evaluateQuestion";

const presetId = "DeepSeek-R1";
console.log(
  await evaluateQuestion(presetId, {
    question:
      "พรชิตซื้อกระโปรงและเสื้อยืดจำนวนหนึ่ง ถ้ากระโปรงตัวละ 70 บาท และเสื้อยืดตัวละ 30 บาท ถ้าเธอจ่ายเงินไปทั้งสิ้น 810 บาท อยากทราบว่าอัตราส่วนจำนวนกระโปรงต่อจำนวนเสื้อยืดที่ซื้อเป็นเท่าใด?",
    a: "3:2",
    b: "4:1",
    c: "4:3",
    d: "5:2",
    e: "5:3",
    answer: "a",
    subject: "Quant",
  })
);

import type { NextApiRequest, NextApiResponse } from "next";

type Target = {
  Name: string;
  Head: [number, number, number];
  HRP: [number, number, number];
};

type AimbotRequest = {
  cameraPos: [number, number, number];
  targets: Target[];
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = req.headers["x-api-key"];
  const SECRET = "848JF18398190DKOIAMNKSFJNANJWEJIKWAKWOLDKWAKP";

  // Optional: verify API key
  if (SECRET && apiKey !== SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const body = req.body as AimbotRequest;
  const cam = body.cameraPos;
  const targets = body.targets;

  if (!cam || !targets || targets.length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const closest = targets
    .map((t) => {
      const dx = t.Head[0] - cam[0];
      const dy = t.Head[1] - cam[1];
      const dz = t.Head[2] - cam[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      return { ...t, distSq };
    })
    .sort((a, b) => a.distSq - b.distSq)[0];

  const lookVec = normalize([
    closest.Head[0] - cam[0],
    closest.Head[1] - cam[1],
    closest.Head[2] - cam[2],
  ]);

  const targetLookAt = [
    cam[0] + lookVec[0],
    cam[1] + lookVec[1],
    cam[2] + lookVec[2],
  ];

  return res.status(200).json({ cframe: targetLookAt });
}

function normalize(vec: [number, number, number]): [number, number, number] {
  const mag = Math.sqrt(vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2);
  return [vec[0] / mag, vec[1] / mag, vec[2] / mag];
}

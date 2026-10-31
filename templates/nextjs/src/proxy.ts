import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export default function proxy(_request: NextRequest) {
  return NextResponse.next()
}

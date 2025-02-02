import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const res = await fetch("https://nbafantasy.nba.com/api/bootstrap-static")
  const lookupData = await res.json()

  const picks = [
    {
      "element": 98,
      "position": 1,
      "selling_price": 175,
      "multiplier": 1,
      "purchase_price": 175,
      "is_captain": false,
      "is_vice_captain": true
    },
    {
      "element": 364,
      "position": 2,
      "selling_price": 132,
      "multiplier": 1,
      "purchase_price": 132,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 529,
      "position": 3,
      "selling_price": 48,
      "multiplier": 1,
      "purchase_price": 46,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 237,
      "position": 4,
      "selling_price": 172,
      "multiplier": 2,
      "purchase_price": 172,
      "is_captain": true,
      "is_vice_captain": false
    },
    {
      "element": 9,
      "position": 5,
      "selling_price": 72,
      "multiplier": 1,
      "purchase_price": 71,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 52,
      "position": 6,
      "selling_price": 46,
      "multiplier": 0,
      "purchase_price": 46,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 80,
      "position": 7,
      "selling_price": 93,
      "multiplier": 0,
      "purchase_price": 92,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 150,
      "position": 8,
      "selling_price": 48,
      "multiplier": 0,
      "purchase_price": 48,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 224,
      "position": 9,
      "selling_price": 57,
      "multiplier": 0,
      "purchase_price": 55,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 197,
      "position": 10,
      "selling_price": 162,
      "multiplier": 0,
      "purchase_price": 162,
      "is_captain": false,
      "is_vice_captain": false
    }
  ].map(pick => ({...pick, data: lookupData.elements.find((elem: any) => elem.id === pick.element)}))

  

  return NextResponse.json({ data: picks })
}

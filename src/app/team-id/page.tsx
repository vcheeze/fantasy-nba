"use client"

import { Button, Container, Strong, Text, TextField } from "@radix-ui/themes"
import { getCookie } from "cookies-next"

import { setTeamId } from "./actions"

export default function TeamId() {
  const defaultValue = getCookie("teamId")
  return (
    <Container>
      <form action={setTeamId}>
        <Text as="label" htmlFor="teamId">
          Enter your team ID. You can find your team ID in the URL of the{" "}
          <Strong>Points</Strong> tab: https://nbafantasy.nba.com/entry/
          <Text as="span" color="ruby">
            <Strong>YOUR-TEAM-ID-HERE</Strong>
          </Text>
          /event/1
        </Text>
        <TextField.Root mt="4" mb="6">
          <TextField.Input
            name="teamId"
            id="teamId"
            type="number"
            min="1"
            placeholder="12345"
            defaultValue={defaultValue}
          />
        </TextField.Root>
        <Button>Submit</Button>
      </form>
    </Container>
  )
}

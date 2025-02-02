interface Fixture {
  event: number
  date: string
  homeTeam: string
  awayTeam: string
}

interface TeamAppearances {
  team: string
  appearances: number
}

interface EventRange {
  start: number
  end: number
}

export class FixtureAnalyzer {
  private fixtures: Fixture[]

  constructor(fixtures: Fixture[]) {
    // Sort fixtures by event ID for efficient range processing
    this.fixtures = fixtures.sort((a, b) => a.event - b.event)
  }

  /**
   * Get fixtures within a specific event range
   * @param range Event range to filter by
   * @returns Array of fixtures within the range
   */
  public getFixturesInEventRange(range: EventRange): Fixture[] {
    return this.fixtures.filter(
      (fixture) => fixture.event >= range.start && fixture.event <= range.end,
    )
  }

  /**
   * Get teams sorted by appearances within a specific event range
   * @param range Event range to analyze
   * @returns Array of teams sorted by appearances
   */
  public getTeamAppearancesInEventRange(range: EventRange): TeamAppearances[] {
    const fixturesInRange = this.getFixturesInEventRange(range)

    // Count appearances for each team
    const teamCounts = new Map<string, number>()

    fixturesInRange.forEach((fixture) => {
      teamCounts.set(
        fixture.homeTeam,
        (teamCounts.get(fixture.homeTeam) || 0) + 1,
      )
      teamCounts.set(
        fixture.awayTeam,
        (teamCounts.get(fixture.awayTeam) || 0) + 1,
      )
    })

    return Array.from(teamCounts.entries())
      .map(([team, appearances]) => ({
        team,
        appearances,
      }))
      .sort((a, b) => {
        if (b.appearances !== a.appearances) {
          return b.appearances - a.appearances
        }
        return a.team.localeCompare(b.team)
      })
  }

  /**
   * Get teams with most appearances within a specific event range
   * @param range Event range to analyze
   * @param limit Optional limit of teams to return
   * @returns Array of top teams by appearances
   */
  public getMostActiveTeamsInEventRange(
    range: EventRange,
    limit?: number,
  ): TeamAppearances[] {
    const sortedTeams = this.getTeamAppearancesInEventRange(range)
    return limit ? sortedTeams.slice(0, limit) : sortedTeams
  }

  /**
   * Get team's fixtures within a specific event range
   * @param teamName Team to find fixtures for
   * @param range Event range to filter by
   * @returns Array of fixtures involving the team within the range
   */
  public getTeamFixturesInEventRange(
    teamName: string,
    range: EventRange,
  ): Fixture[] {
    return this.getFixturesInEventRange(range).filter(
      (fixture) =>
        fixture.homeTeam === teamName || fixture.awayTeam === teamName,
    )
  }

  /**
   * Get event ranges where a team has consecutive games
   * @param teamName Team to analyze
   * @returns Array of event ranges with consecutive appearances
   */
  public getConsecutiveGameRanges(teamName: string): EventRange[] {
    const teamFixtures = this.fixtures.filter(
      (fixture) =>
        fixture.homeTeam === teamName || fixture.awayTeam === teamName,
    )

    if (teamFixtures.length === 0) {
      return []
    }

    const ranges: EventRange[] = []
    let currentRange: EventRange = {
      start: teamFixtures[0].event,
      end: teamFixtures[0].event,
    }

    for (let i = 1; i < teamFixtures.length; i++) {
      if (teamFixtures[i].event === teamFixtures[i - 1].event + 1) {
        currentRange.end = teamFixtures[i].event
      } else {
        if (currentRange.end > currentRange.start) {
          ranges.push({ ...currentRange })
        }
        currentRange = {
          start: teamFixtures[i].event,
          end: teamFixtures[i].event,
        }
      }
    }

    // Add the last range if it contains consecutive games
    if (currentRange.end > currentRange.start) {
      ranges.push(currentRange)
    }

    return ranges
  }

  // Original methods remain unchanged
  public getTeamAppearances(n?: number): TeamAppearances[] {
    const fixturesToAnalyze = n ? this.fixtures.slice(0, n) : this.fixtures

    const teamCounts = new Map<string, number>()

    fixturesToAnalyze.forEach((fixture) => {
      teamCounts.set(
        fixture.homeTeam,
        (teamCounts.get(fixture.homeTeam) || 0) + 1,
      )
      teamCounts.set(
        fixture.awayTeam,
        (teamCounts.get(fixture.awayTeam) || 0) + 1,
      )
    })

    return Array.from(teamCounts.entries())
      .map(([team, appearances]) => ({
        team,
        appearances,
      }))
      .sort((a, b) => {
        if (b.appearances !== a.appearances) {
          return b.appearances - a.appearances
        }
        return a.team.localeCompare(b.team)
      })
  }

  public getTeamFixtures(teamName: string, n?: number): Fixture[] {
    const fixturesToSearch = n ? this.fixtures.slice(0, n) : this.fixtures
    return fixturesToSearch.filter(
      (fixture) =>
        fixture.homeTeam === teamName || fixture.awayTeam === teamName,
    )
  }

  public getTeamsWithAppearances(count: number, n?: number): string[] {
    return this.getTeamAppearances(n)
      .filter((team) => team.appearances === count)
      .map((team) => team.team)
  }
}

// Example usage
// const sampleFixtures: Fixture[] = [
//   { event: 1, date: '2024-01-01', homeTeam: 'Team A', awayTeam: 'Team B' },
//   { event: 1, date: '2024-01-01', homeTeam: 'Team C', awayTeam: 'Team D' },
//   { event: 2, date: '2024-01-08', homeTeam: 'Team B', awayTeam: 'Team C' },
//   { event: 2, date: '2024-01-08', homeTeam: 'Team D', awayTeam: 'Team A' },
//   { event: 3, date: '2024-01-15', homeTeam: 'Team A', awayTeam: 'Team C' },
//   { event: 4, date: '2024-01-22', homeTeam: 'Team B', awayTeam: 'Team D' },
// ]

// const analyzer = new FixtureAnalyzer(sampleFixtures)

// // Analyze fixtures within event range 2-3
// const eventRange: EventRange = { start: 2, end: 3 }
// console.log('Teams sorted by appearances in events 2-3:')
// console.log(analyzer.getTeamAppearancesInEventRange(eventRange))

// // Get most active teams in range (limited to top 2)
// console.log('\nTop 2 most active teams in events 2-3:')
// console.log(analyzer.getMostActiveTeamsInEventRange(eventRange, 2))

// // Get Team A's fixtures in range
// console.log('\nTeam A fixtures in events 2-3:')
// console.log(analyzer.getTeamFixturesInEventRange('Team A', eventRange))

// // Get consecutive game ranges for Team A
// console.log('\nConsecutive game ranges for Team A:')
// console.log(analyzer.getConsecutiveGameRanges('Team A'))

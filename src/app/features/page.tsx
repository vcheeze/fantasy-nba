'use client'

import React, { useEffect, useState } from 'react'

import { ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { recordVote } from './actions'

type Feature = {
  id: number
  title: string
  description: string
  votes: number
  status: string
}

export default function FeatureVotingPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [votedFeatures, setVotedFeatures] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setFeatures(data.features)
      setVotedFeatures(data.votedFeatures)
    } catch (error) {
      toast.error('Failed to load features')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (featureId: number) => {
    try {
      const result = await recordVote(featureId)

      if (!result.success) {
        toast.error(result.error || 'Failed to record vote')
        return
      }

      // Optimistically update UI
      setFeatures(
        features.map((feature) =>
          feature.id === featureId
            ? { ...feature, votes: feature.votes + 1 }
            : feature,
        ),
      )
      setVotedFeatures([...votedFeatures, featureId])

      toast.success('Vote recorded successfully!')
    } catch (error) {
      toast.error('Failed to record vote')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under-review':
        return 'bg-yellow-50 text-yellow-600'
      case 'planned':
        return 'bg-blue-50 text-blue-600'
      case 'under-development':
        return 'bg-orange-50 text-orange-600'
      case 'completed':
        return 'bg-green-50 text-green-600'
      case 'on-hold':
        return 'bg-rose-50 text-rose-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Upcoming Features
        </h2>
        <p className="text-xl text-muted-foreground">
          A list of upcoming features that you can upvote. No provision to
          submit new features yet, but I&apos;m planning to add it as one
          possible feature ( • ᴗ - )
        </p>
      </div>
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-6 w-[250px] max-w-full" />
                      <Skeleton className="h-4 w-[350px] max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-[100px] self-start sm:self-center" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-[100px]" />
                </CardContent>
              </Card>
            ))
          : features.map((feature) => (
              <Card key={feature.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {feature.description}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleVote(feature.id)}
                      variant={
                        votedFeatures.includes(feature.id)
                          ? 'secondary'
                          : 'outline'
                      }
                      className="min-w-[100px] hidden sm:inline-flex sm:self-center"
                      disabled={votedFeatures.includes(feature.id)}
                    >
                      <ThumbsUp
                        className={`mr-2 h-4 w-4 ${
                          votedFeatures.includes(feature.id)
                            ? 'fill-current'
                            : ''
                        }`}
                      />
                      {feature.votes}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="max-sm:flex max-sm:justify-between">
                  <Badge className={`${getStatusColor(feature.status)}`}>
                    {feature.status.replace('-', ' ').charAt(0).toUpperCase() +
                      feature.status.slice(1)}
                  </Badge>
                  <Button
                    onClick={() => handleVote(feature.id)}
                    variant={
                      votedFeatures.includes(feature.id)
                        ? 'secondary'
                        : 'outline'
                    }
                    className="min-w-[100px] self-center md:hidden"
                    disabled={votedFeatures.includes(feature.id)}
                  >
                    <ThumbsUp
                      className={`mr-2 h-4 w-4 ${
                        votedFeatures.includes(feature.id) ? 'fill-current' : ''
                      }`}
                    />
                    {feature.votes}
                  </Button>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'

import { ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
      case 'planned':
        return 'text-blue-600'
      case 'under-consideration':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Upcoming Features
        </h2>
        <p className="text-xl text-muted-foreground">
          A list of upcoming features that you can upvote. No provision to
          submit new features yet, but I'm planning to add it as one possible
          feature ( • ᴗ - )
        </p>
      </div>
      <div className="space-y-4">
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleVote(feature.id)}
                  variant={
                    votedFeatures.includes(feature.id) ? 'secondary' : 'outline'
                  }
                  className="min-w-[100px]"
                  disabled={votedFeatures.includes(feature.id)}
                >
                  <ThumbsUp
                    className={`mr-2 h-4 w-4 ${
                      votedFeatures.includes(feature.id) ? 'fill-current' : ''
                    }`}
                  />
                  {feature.votes}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <span
                className={`text-sm font-medium ${getStatusColor(feature.status)}`}
              >
                {feature.status.replace('-', ' ').charAt(0).toUpperCase() +
                  feature.status.slice(1)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

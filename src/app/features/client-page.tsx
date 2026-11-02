'use client'

import { ThumbsUpIcon } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
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
import { type FeaturesResponse, useFeatures } from '@/hooks/api/features'

import { recordVote } from './actions'

export default function FeatureVotingPage() {
  const { data, isLoading } = useFeatures()
  const queryClient = useQueryClient()

  const voteMutation = useMutation({
    mutationFn: recordVote,
    onMutate: async (featureId: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['features'] })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<FeaturesResponse>([
        'features',
      ])

      // Optimistically update
      queryClient.setQueryData<FeaturesResponse>(['features'], (old) => {
        if (!old) {
          return old
        }
        return {
          features: old.features.map((feature) =>
            feature.id === featureId
              ? { ...feature, votes: feature.votes + 1 }
              : feature
          ),
          votedFeatures: [...old.votedFeatures, featureId],
        }
      })

      return { previousData }
    },
    onError: (error, featureId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['features'], context.previousData)
      }
      toast.error('Failed to record vote')
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Failed to record vote')
        return
      }
      toast.success('Vote recorded successfully!')
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })

  const handleVote = (featureId: number) => {
    voteMutation.mutate(featureId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under-review':
        return 'border-border bg-transparent text-foreground hover:bg-transparent'
      case 'planned':
        return 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary'
      case 'under-development':
        return 'border-transparent bg-signal/10 text-signal hover:bg-signal/10'
      case 'completed':
        return 'border-transparent bg-primary text-primary-foreground hover:bg-primary'
      case 'on-hold':
        return 'border-transparent bg-muted text-muted-foreground hover:bg-muted'
      default:
        return 'border-transparent bg-muted text-muted-foreground hover:bg-muted'
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        description={
          <>
            A list of upcoming features that you can upvote. No provision to
            submit new features yet, but I&apos;m planning to add it as one
            possible feature ( • ᴗ - )
          </>
        }
        title="Roadmap"
      />
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1 space-y-3">
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
          : data?.features.map((feature) => (
              <Card
                className="animate-fade-in overflow-hidden transition-shadow hover:shadow-md"
                key={feature.id}
              >
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="font-bold font-display text-2xl leading-none tracking-tight">
                        <h2>{feature.title}</h2>
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {feature.description}
                      </CardDescription>
                    </div>
                    <Button
                      className="hidden min-w-[100px] sm:inline-flex sm:self-center"
                      disabled={data.votedFeatures.includes(feature.id)}
                      onClick={() => handleVote(feature.id)}
                      variant={
                        data.votedFeatures.includes(feature.id)
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      <ThumbsUpIcon
                        className={`mr-2 h-4 w-4 ${
                          data.votedFeatures.includes(feature.id)
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
                    {feature.status.charAt(0).toUpperCase() +
                      feature.status.slice(1).replaceAll('-', ' ')}
                  </Badge>
                  <Button
                    className="min-w-[100px] self-center md:hidden"
                    disabled={data.votedFeatures.includes(feature.id)}
                    onClick={() => handleVote(feature.id)}
                    variant={
                      data.votedFeatures.includes(feature.id)
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    <ThumbsUpIcon
                      className={`mr-2 h-4 w-4 ${
                        data.votedFeatures.includes(feature.id)
                          ? 'fill-current'
                          : ''
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

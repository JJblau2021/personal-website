import { notFound } from "next/navigation"
import { getAppById, subApps } from "@/app/data/apps"
import { AppRunnerClient } from "./AppRunnerClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return subApps.map((app) => ({
    id: app.id,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const app = getAppById(id)

  if (!app) {
    return {
      title: "应用未找到",
    }
  }

  return {
    title: app.name,
    description: app.description,
  }
}

export default async function AppRunnerPage({ params }: PageProps) {
  const { id } = await params
  const app = getAppById(id)

  if (!app) {
    notFound()
  }

  return <AppRunnerClient app={app} />
}

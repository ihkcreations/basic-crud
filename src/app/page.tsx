import { TaskList } from '@/components/task-list'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <TaskList />
      </main>
    </>
  )
}
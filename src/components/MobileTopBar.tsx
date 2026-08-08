import { useState } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNav } from '@/components/SidebarNav'
import { initials } from '@/lib/selectors'

export function MobileTopBar() {
  const [open, setOpen] = useState(false)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const users = useAppStore((s) => s.users)
  const currentUser = users.find((u) => u.id === currentUserId)

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/85 px-3 backdrop-blur-md lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Открыть меню" className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" title="Навигация" description="Основное меню приложения" className="p-0">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">Развитие навыков</span>
      </span>

      {currentUser ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={`${currentUser.avatarColor} text-white text-xs`}>
            {initials(currentUser.name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="h-8 w-8 shrink-0" />
      )}
    </header>
  )
}

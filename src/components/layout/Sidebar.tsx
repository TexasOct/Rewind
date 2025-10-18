import { cn } from '@/lib/utils'
import { MenuItem } from '@/lib/config/menu'
import { MenuButton } from '@/components/shared/MenuButton'
import { useUIStore } from '@/lib/stores/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/custom/system/theme/theme-toggle'
import { LanguageToggle } from '@/components/custom/system/language/language-toggle'
import { useTranslation } from 'react-i18next'

interface SidebarProps {
  collapsed: boolean
  mainItems: MenuItem[]
  bottomItems: MenuItem[]
  activeItemId: string
  onMenuClick: (menuId: string, path: string) => void
}

export function Sidebar({ collapsed, mainItems, bottomItems, activeItemId, onMenuClick }: SidebarProps) {
  const { toggleSidebar, badges } = useUIStore()
  const { t } = useTranslation()

  return (
    <aside className={cn('flex flex-col border-r bg-card transition-all duration-200', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo 区域 */}
      <div className="flex h-14 items-center border-b px-4">{!collapsed && <h1 className="text-lg font-semibold">Rewind</h1>}</div>

      {/* 主菜单区域 */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {mainItems.map((item) => (
          <MenuButton
            key={item.id}
            icon={item.icon}
            label={t(item.labelKey)}
            active={activeItemId === item.id}
            collapsed={collapsed}
            badge={badges[item.id]}
            onClick={() => onMenuClick(item.id, item.path)}
          />
        ))}
      </div>

      {/* 底部菜单区域 */}
      <div className="space-y-1 border-t p-2">
        {bottomItems.map((item) => (
          <MenuButton
            key={item.id}
            icon={item.icon}
            label={t(item.labelKey)}
            active={activeItemId === item.id}
            collapsed={collapsed}
            badge={badges[item.id]}
            onClick={() => onMenuClick(item.id, item.path)}
          />
        ))}

        {/* 主题和语言切换器 */}
        <div className={cn(
          'flex flex-col gap-2 py-2 px-1',
          collapsed ? 'items-center' : 'px-3'
        )}>
          {collapsed ? (
            // 折叠状态：只显示按钮
            <>
              <ThemeToggle />
              <LanguageToggle />
            </>
          ) : (
            // 展开状态：标题 + 按钮
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium">{t('settings.theme')}</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium">{t('common.language')}</span>
                <LanguageToggle />
              </div>
            </>
          )}
        </div>

        {/* 折叠/展开按钮 */}
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="w-full justify-start">
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2">{t('common.collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

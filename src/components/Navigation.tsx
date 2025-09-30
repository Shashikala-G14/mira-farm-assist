import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Shield, BookOpen, Activity, FileText, Bell, BarChart3, MessageCircle, LogOut, Home, Briefcase } from 'lucide-react';
import { MiraChat } from './MiraChat';
import { useAuth } from '@/contexts/AuthContext';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMira, setShowMira] = useState(false);
  const location = useLocation();
  const { profile, userRole, signOut } = useAuth();

  const farmerNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Risk Assessment', path: '/risk-assessment', icon: Activity },
    { name: 'Learning', path: '/learning', icon: BookOpen },
    { name: 'Records', path: '/records', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Contact', path: '/contact', icon: MessageCircle },
  ];

  const policymakerNavItems = [
    { name: 'Dashboard', path: '/policymaker', icon: Briefcase },
    { name: 'Farmers', path: '/', icon: Home },
  ];

  const navItems = userRole === 'policymaker' ? policymakerNavItems : farmerNavItems;
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">KrishiCure</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Link to={item.path}>
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                );
              })}
              {userRole === 'farmer' && (
                <Button
                  variant="outline"
                  onClick={() => setShowMira(true)}
                  className="ml-4 flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Mira AI</span>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-4">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {profile?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="font-semibold">{profile?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {profile?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                    </div>
                  </div>
                  
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.name}
                        asChild
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="justify-start space-x-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link to={item.path}>
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    );
                  })}
                  {userRole === 'farmer' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowMira(true);
                        setIsOpen(false);
                      }}
                      className="justify-start space-x-2 mt-4"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat with Mira AI</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="justify-start space-x-2 text-destructive hover:text-destructive mt-4"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <MiraChat isOpen={showMira} onClose={() => setShowMira(false)} />
    </>
  );
};

export default Navigation;

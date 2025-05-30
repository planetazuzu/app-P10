
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, Hash, MessageSquare, PlusCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: string;
  sender: 'user' | 'bot' | string; // 'user' for current user, 'bot' or name for others
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  avatar?: string;
  messages: Message[];
  unread?: number;
  lastMessage?: string; // For display in conversation list
}

interface MockContact {
  id: string;
  name: string;
  avatar?: string;
  role?: string; // Optional role for context
}

const MOCK_INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'general',
    name: 'General',
    type: 'channel',
    messages: [
      { id: 'msg1', sender: 'Alice (Coordinadora)', senderName: 'Alice (Coordinadora)', text: '¡Hola equipo!', timestamp: '10:00 AM', avatar: 'https://placehold.co/40x40.png?text=AC' },
      { id: 'msg2', sender: 'Bob (Técnico)', senderName: 'Bob (Técnico)', text: 'Buenos días, ¿alguna novedad?', timestamp: '10:01 AM', avatar: 'https://placehold.co/40x40.png?text=BT' },
    ],
    unread: 2,
    lastMessage: 'Buenos días, ¿alguna novedad?',
  },
  {
    id: 'coordinacion',
    name: 'Coordinación Turno Tarde',
    type: 'channel',
    messages: [
      { id: 'msg3', sender: 'Carlos (Coordinador)', senderName: 'Carlos C.', text: 'Revisad la asignación de la unidad M-03.', timestamp: '11:30 AM', avatar: 'https://placehold.co/40x40.png?text=CC' },
    ],
    lastMessage: 'Revisad la asignación de la unidad M-03.',
  },
  {
    id: 'dm-centro-coordinador',
    name: 'Soporte al Paciente (C. Coordinador)',
    type: 'dm',
    avatar: 'https://placehold.co/40x40.png?text=SP',
    messages: [
      { id: 'msg-cc-1', sender: 'Centro Coordinador', senderName: 'Centro Coordinador', text: 'Bienvenido. ¿En qué podemos ayudarle hoy?', timestamp: '09:00 AM' },
    ],
    lastMessage: 'Bienvenido. ¿En qué podemos ayudarle hoy?',
  },
  {
    id: 'bot-soporte',
    name: 'Soporte IA',
    type: 'dm',
    avatar: 'https://placehold.co/40x40.png?text=IA',
    messages: [
      { id: 'msg6', sender: 'bot', senderName: 'Soporte IA', text: 'Bienvenido al sistema de mensajería. ¿En qué puedo ayudarte hoy?', timestamp: '08:00 AM' },
    ],
    lastMessage: 'Bienvenido al sistema de mensajería...',
  },
];

const MOCK_AVAILABLE_CONTACTS: MockContact[] = [
    { id: 'alice-coord', name: 'Alice (Coordinadora)', avatar: 'https://placehold.co/40x40.png?text=AC', role: 'Coordinación'},
    { id: 'bob-tech', name: 'Bob (Técnico)', avatar: 'https://placehold.co/40x40.png?text=BT', role: 'Equipo Móvil'},
    { id: 'eva-hosp', name: 'Eva (Hospital Central)', avatar: 'https://placehold.co/40x40.png?text=EH', role: 'Hospital'},
    { id: 'soporte-ia', name: 'Soporte IA', avatar: 'https://placehold.co/40x40.png?text=IA', role: 'Asistente'},
];


const ChatMessage: React.FC<{ message: Message; currentUserEmail: string | undefined }> = ({ message, currentUserEmail }) => {
  const isCurrentUser = message.sender === 'user' || message.sender === currentUserEmail;
  const initials = message.senderName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className={cn('flex items-start gap-2.5 py-2', isCurrentUser ? 'justify-end' : '')}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.avatar || `https://placehold.co/40x40.png?text=${initials}`} alt={message.senderName} data-ai-hint="avatar profile" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-[70%]')}>
        {!isCurrentUser && <p className="text-xs text-muted-foreground mb-0.5 ml-1">{message.senderName}</p>}
        <div
          className={cn(
            'rounded-xl p-2.5 text-sm shadow-sm',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-card text-card-foreground rounded-bl-none'
          )}
        >
          {message.text}
        </div>
        <p className={cn('text-[10px] text-muted-foreground/80 mt-1', isCurrentUser ? 'text-right mr-1' : 'text-left ml-1')}>{message.timestamp}</p>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
           <AvatarImage src={message.avatar || `https://placehold.co/40x40.png?text=${initials}`} alt={message.senderName} data-ai-hint="avatar profile"/>
           <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

interface TypingIndicatorProps {
    typingUsers: { name: string; avatar?: string }[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
    if (typingUsers.length === 0) return null;

    const names = typingUsers.map(u => u.name).join(', ');
    const text = `${names} ${typingUsers.length > 1 ? 'están escribiendo' : 'está escribiendo'}...`;

    return (
        <div className="px-4 pb-2 text-xs text-muted-foreground flex items-center gap-2">
            {typingUsers.slice(0,3).map(user => ( // Show max 3 avatars
                <Avatar key={user.name} className="h-5 w-5">
                    <AvatarImage src={user.avatar || `https://placehold.co/20x20.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="typing avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ))}
            <span>{text}</span>
        </div>
    );
};


export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_INITIAL_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const previousConversationIdRef = useRef<string | null>(null);
  const lastScrolledMessageIdRef = useRef<string | null>(null);

  const [typingInConversations, setTypingInConversations] = useState<Record<string, { name: string, avatar?: string } | null>>({});
  const [viewMode, setViewMode] = useState<'listConversations' | 'selectNewContact'>('listConversations');


  useEffect(() => {
    let initialConvId: string | null = null;
    if (user?.role === 'individual') {
        let individualChat = conversations.find(c => c.id === 'dm-centro-coordinador');
        if (!individualChat) {
            individualChat = {
                id: 'dm-centro-coordinador',
                name: 'Soporte al Paciente (C. Coordinador)',
                type: 'dm',
                avatar: 'https://placehold.co/40x40.png?text=SP',
                messages: [{ id: 'init-msg-ind', sender: 'Centro Coordinador', senderName: 'Centro Coordinador', text: 'Bienvenido. ¿En qué podemos ayudarle?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}],
                lastMessage: 'Bienvenido. ¿En qué podemos ayudarle?',
            };
            setConversations(prev => [individualChat!, ...prev.filter(c => c.id !== 'dm-centro-coordinador')]);
        }
        initialConvId = individualChat.id;
    } else {
        initialConvId = conversations[0]?.id || null;
    }
    if(initialConvId) {
        setSelectedConversationId(initialConvId);
        // Mark as read
        setConversations(prev =>
            prev.map(conv =>
                conv.id === initialConvId ? { ...conv, unread: 0 } : conv
            )
        );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Run only when user context changes


  useEffect(() => {
    const viewport = scrollAreaRef.current;
    if (!viewport || !selectedConversation) return;

    const { scrollHeight, clientHeight, scrollTop } = viewport;
    const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1];

    if (!lastMessage) return;

    const conversationJustChanged = selectedConversationId !== previousConversationIdRef.current;

    if (conversationJustChanged) {
      setTimeout(() => {
        viewport.scrollTo({ top: scrollHeight, behavior: 'auto' });
        lastScrolledMessageIdRef.current = lastMessage.id;
      }, 0);
      previousConversationIdRef.current = selectedConversationId;
    } else {
      const isNewMessageToScrollTo = lastMessage.id !== lastScrolledMessageIdRef.current;
      const isUserNearBottom = scrollHeight - clientHeight <= scrollTop + 100;

      if (isNewMessageToScrollTo && isUserNearBottom) {
        setTimeout(() => {
          viewport.scrollTo({ top: scrollHeight, behavior: 'smooth' });
          lastScrolledMessageIdRef.current = lastMessage.id;
        }, 0);
      }
    }
  }, [selectedConversationId, conversations]); // Dependency on conversations to catch new messages

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setConversations(prev =>
        prev.map(conv => conv.id === id ? { ...conv, unread: 0 } : conv)
    );
    inputRef.current?.focus();
    setViewMode('listConversations'); // Ensure we are back to list view
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    const messageToSend: Message = {
      id: `msg-${Date.now()}`,
      sender: user.email || 'user',
      senderName: user.name,
      avatar: `https://placehold.co/40x40.png?text=${getInitials(user.name)}`,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === selectedConversationId
          ? { ...conv, messages: [...conv.messages, messageToSend], lastMessage: newMessage.substring(0, 30) + (newMessage.length > 30 ? '...' : '') }
          : conv
      )
    );
    setNewMessage('');
    inputRef.current?.focus();

    // Simulate bot/Alice reply
    const convConfig = conversations.find(c => c.id === selectedConversationId);
    if (convConfig && (convConfig.id === 'bot-soporte' || convConfig.id === 'general' || convConfig.type === 'dm')) {
        const replier = convConfig.id === 'bot-soporte' ? 
            { name: 'Soporte IA', avatar: 'https://placehold.co/40x40.png?text=IA', senderId: 'bot'} :
            convConfig.id === 'general' ? 
            { name: 'Alice (Coordinadora)', avatar: 'https://placehold.co/40x40.png?text=AC', senderId: 'Alice (Coordinadora)'} :
            { name: convConfig.name, avatar: convConfig.avatar, senderId: convConfig.name}; // For DMs, the other person replies

        if (replier.senderId === user.email) return; // Don't reply to self in DM

        setTypingInConversations(prev => ({ ...prev, [selectedConversationId]: replier }));

      setTimeout(() => {
        setTypingInConversations(prev => ({ ...prev, [selectedConversationId]: null }));
        const replies = [
            `He recibido tu mensaje: "${messageToSend.text.substring(0,20)}${messageToSend.text.length > 20 ? '...' : ''}". Lo estoy procesando.`,
            `Interesante lo que dices sobre "${messageToSend.text.substring(0,15)}${messageToSend.text.length > 15 ? '...' : ''}". ¿Podrías dar más detalles?`,
            `Entendido. Respecto a "${messageToSend.text.substring(0,25)}${messageToSend.text.length > 25 ? '...' : ''}", te responderé en breve.`,
            `Gracias por tu mensaje. Tomo nota de: "${messageToSend.text.substring(0,30)}${messageToSend.text.length > 30 ? '...' : ''}".`
        ];
        const botReplyText = replier.senderId === 'bot'
            ? `Soy un bot, pero he entendido: "${messageToSend.text.substring(0,25)}${messageToSend.text.length > 25 ? '...' : ''}".`
            : replies[Math.floor(Math.random() * replies.length)];

        const botReply: Message = {
          id: `reply-${Date.now()}`,
          sender: replier.senderId,
          senderName: replier.name,
          avatar: replier.avatar,
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setConversations(prevConvs =>
          prevConvs.map(conv => {
            if (conv.id === selectedConversationId) {
              return { ...conv, messages: [...conv.messages, botReply], lastMessage: botReplyText.substring(0, 30) + (botReplyText.length > 30 ? '...' : '') };
            } else if (conv.id !== selectedConversationId && (conv.id === 'bot-soporte' || conv.id === 'general' || conv.id === replier.senderId)) {
                // If reply is to a non-active conversation, increment unread
                // This logic needs refinement for DMs if the replier is the "other user" of a DM
                // For now, just increment unread for the specific conversation if it's not selected.
                // This part might need more robust logic based on sender for DMs
                if (conv.id === selectedConversationId) {} // Already handled
                else if (conv.id === botReply.sender || conv.id === 'dm-' + botReply.sender) { // Simple check
                     return { ...conv, unread: (conv.unread || 0) + 1, lastMessage: botReplyText.substring(0,30) + (botReplyText.length > 30 ? '...' : '') };
                }
            }
            return conv;
          })
        );
      }, 1000 + Math.random() * 1500);
    }
  };

  const getInitials = (name: string = '') => {
    const parts = name.split(/[.\s()]+/);
    let initials = parts.filter(p => p.length > 0).map(n => n[0]).join('');
    if (initials.length > 2) {
        initials = initials.substring(0,2);
    }
    return initials.toUpperCase() || 'CH';
  };

  const handleStartNewChat = (contact: MockContact) => {
    const dmId = `dm-${contact.id}`;
    const existingDm = conversations.find(c => c.id === dmId);
    if (existingDm) {
        handleSelectConversation(dmId);
    } else {
        const newDm: Conversation = {
            id: dmId,
            name: contact.name,
            type: 'dm',
            avatar: contact.avatar,
            messages: [
                {
                    id: `sys-${Date.now()}`,
                    sender: 'system',
                    senderName: 'Sistema',
                    text: `Has iniciado un chat con ${contact.name}.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ],
            lastMessage: `Chat iniciado con ${contact.name}.`
        };
        setConversations(prev => [newDm, ...prev]);
        handleSelectConversation(dmId);
    }
    setViewMode('listConversations');
  };
  
  const filteredConversations = user?.role === 'individual'
    ? conversations.filter(c => c.id === 'dm-centro-coordinador')
    : conversations;

  const currentTypingUser = selectedConversationId ? typingInConversations[selectedConversationId] : null;


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.12)-2px)] shadow-lg border rounded-lg"> {/* Adjusted height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversation List / New Chat */}
        <aside className="w-full max-w-xs border-r bg-muted/20 flex flex-col">
          <div className="p-3 border-b bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
             {viewMode === 'selectNewContact' && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMode('listConversations')}>
                    <ArrowLeft className="h-4 w-4"/>
                </Button>
             )}
             <h2 className="text-md font-semibold text-secondary flex items-center gap-1.5">
                {viewMode === 'listConversations' ? <MessageSquare className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                {viewMode === 'listConversations' ? 'Canales y DMs' : 'Iniciar Chat Con'}
             </h2>
            </div>
            {viewMode === 'listConversations' && user?.role !== 'individual' && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setViewMode('selectNewContact')}>
                    <PlusCircle className="h-5 w-5"/>
                </Button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <nav className="py-1">
              {viewMode === 'listConversations' ? (
                filteredConversations.sort((a,b) => (b.messages[b.messages.length-1]?.timestamp || '0').localeCompare(a.messages[a.messages.length-1]?.timestamp || '0') ).map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 text-left text-sm hover:bg-accent transition-colors rounded-md mx-1.5 my-0.5",
                      selectedConversationId === conv.id ? "bg-primary/10 text-primary ring-1 ring-primary/50 font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Avatar className="h-7 w-7 text-xs">
                      <AvatarImage src={conv.avatar || `https://placehold.co/32x32.png?text=${getInitials(conv.name)}`} alt={conv.name} data-ai-hint="avatar channel list" />
                      <AvatarFallback>{getInitials(conv.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                        <span className="block truncate">{conv.name}</span>
                        {conv.lastMessage && <span className="text-xs text-muted-foreground/70 block truncate">{conv.lastMessage}</span>}
                    </div>
                    {conv.unread && conv.unread > 0 && (
                      <span className="ml-auto text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-semibold">
                        {conv.unread}
                      </span>
                    )}
                    {conv.type === 'channel' ? <Hash className="h-3.5 w-3.5 text-muted-foreground/60" /> : <Users className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  </button>
                ))
              ) : ( // viewMode === 'selectNewContact'
                MOCK_AVAILABLE_CONTACTS.map(contact => (
                    <button
                        key={contact.id}
                        onClick={() => handleStartNewChat(contact)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors rounded-md mx-1.5 my-0.5 text-muted-foreground hover:text-foreground"
                    >
                        <Avatar className="h-7 w-7 text-xs">
                            <AvatarImage src={contact.avatar || `https://placehold.co/32x32.png?text=${getInitials(contact.name)}`} alt={contact.name} data-ai-hint="avatar contact list" />
                            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <span className="block truncate">{contact.name}</span>
                            {contact.role && <span className="text-xs text-muted-foreground/70 block truncate">{contact.role}</span>}
                        </div>
                    </button>
                ))
              )}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              <header className="p-3 border-b flex items-center gap-2.5 shadow-sm bg-card">
                <Avatar className="h-8 w-8">
                   <AvatarImage src={selectedConversation.avatar || `https://placehold.co/40x40.png?text=${getInitials(selectedConversation.name)}`} alt={selectedConversation.name} data-ai-hint="avatar header chat"/>
                  <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-md font-semibold text-foreground">{selectedConversation.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.type === 'channel' ? `Canal con ${selectedConversation.messages.length} mensajes` : 'Mensaje directo'}
                  </p>
                </div>
              </header>

              <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
                <div className="space-y-1">
                  {selectedConversation.messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} currentUserEmail={user?.email} />
                  ))}
                </div>
              </ScrollArea>
              
              {currentTypingUser && (
                <div className="px-4 pb-1.5 pt-1 text-xs text-muted-foreground flex items-center gap-1.5 border-t">
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={currentTypingUser.avatar || `https://placehold.co/20x20.png?text=${getInitials(currentTypingUser.name)}`} alt={currentTypingUser.name} data-ai-hint="typing avatar" />
                        <AvatarFallback>{getInitials(currentTypingUser.name)}</AvatarFallback>
                    </Avatar>
                    <span>{currentTypingUser.name} está escribiendo...</span>
                    <Loader2 className="h-3 w-3 animate-spin ml-1"/>
                </div>
              )}

              <footer className="p-2.5 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={`Mensaje a ${selectedConversation.type === 'channel' ? '#' : ''}${selectedConversation.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 h-9 text-sm"
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" className="btn-primary rounded-md h-9 w-9" disabled={!newMessage.trim()}>
                    <SendHorizonal className="h-4 w-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">Seleccione una conversación</p>
                <p className="text-sm">o inicie una nueva para empezar a chatear.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

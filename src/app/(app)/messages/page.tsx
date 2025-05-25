
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, Hash, MessageSquare } from 'lucide-react';
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
}

const mockConversations: Conversation[] = [
  {
    id: 'general',
    name: 'General',
    type: 'channel',
    messages: [
      { id: 'msg1', sender: 'Alice', senderName: 'Alice', text: '¡Hola equipo!', timestamp: '10:00 AM', avatar: 'https://placehold.co/40x40.png?text=A' },
      { id: 'msg2', sender: 'Bob', senderName: 'Bob', text: 'Buenos días, ¿alguna novedad?', timestamp: '10:01 AM', avatar: 'https://placehold.co/40x40.png?text=B' },
    ],
    unread: 2,
  },
  {
    id: 'coordinacion',
    name: 'Coordinación Turno Tarde',
    type: 'channel',
    messages: [
      { id: 'msg3', sender: 'Carlos (Coordinador)', senderName: 'Carlos C.', text: 'Revisad la asignación de la unidad M-03.', timestamp: '11:30 AM', avatar: 'https://placehold.co/40x40.png?text=CC' },
    ],
  },
  {
    id: 'dm-eva',
    name: 'Eva Gómez (Hospital Central)',
    type: 'dm',
    avatar: 'https://placehold.co/40x40.png?text=EG',
    messages: [
      { id: 'msg4', sender: 'Eva Gómez', senderName: 'Eva Gómez', text: 'Necesito confirmar el traslado del paciente de la habitación 301.', timestamp: '09:15 AM' },
      { id: 'msg5', sender: 'user', senderName: 'Tú', text: 'Recibido Eva, lo consulto y te digo.', timestamp: '09:17 AM' },
    ],
    unread: 1,
  },
  {
    id: 'bot-soporte',
    name: 'Soporte IA',
    type: 'dm',
    avatar: 'https://placehold.co/40x40.png?text=IA',
    messages: [
      { id: 'msg6', sender: 'bot', senderName: 'Soporte IA', text: 'Bienvenido al sistema de mensajería. ¿En qué puedo ayudarte hoy?', timestamp: '08:00 AM' },
    ],
  },
];

const ChatMessage: React.FC<{ message: Message; currentUserEmail: string | undefined }> = ({ message, currentUserEmail }) => {
  const isCurrentUser = message.sender === 'user' || message.sender === currentUserEmail;
  const initials = message.senderName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className={cn('flex items-start gap-3 py-3', isCurrentUser ? 'justify-end' : '')}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.avatar || `https://placehold.co/40x40.png?text=${initials}`} alt={message.senderName} data-ai-hint="avatar profile" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-[70%]')}>
        {!isCurrentUser && <p className="text-xs text-muted-foreground mb-0.5">{message.senderName}</p>}
        <div
          className={cn(
            'rounded-lg p-3 text-sm shadow-md',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-card text-card-foreground rounded-bl-none'
          )}
        >
          {message.text}
        </div>
        <p className={cn('text-xs text-muted-foreground mt-1', isCurrentUser ? 'text-right' : 'text-left')}>{message.timestamp}</p>
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


export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScrolledMessageIdRef = useRef<string | null>(null);
  const previousConversationIdRef = useRef<string | null>(null);


  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  useEffect(() => {
    const viewport = scrollAreaRef.current;
    if (viewport && selectedConversation) {
      const { scrollHeight, clientHeight, scrollTop } = viewport;
      const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1];
      
      // Determine if user is near the bottom or if it's a new message they sent
      const isUserNearBottom = scrollHeight - clientHeight <= scrollTop + 100; // 100px threshold
      const conversationChanged = selectedConversationId !== previousConversationIdRef.current;
      const isNewMessageFromUser = lastMessage?.sender === 'user' && lastMessage?.id !== lastScrolledMessageIdRef.current;

      if (lastMessage && (conversationChanged || isNewMessageFromUser || isUserNearBottom)) {
        // Use setTimeout to ensure DOM has updated before scrolling
        setTimeout(() => {
            viewport.scrollTo({ top: scrollHeight, behavior: conversationChanged ? 'auto' : 'smooth' });
            lastScrolledMessageIdRef.current = lastMessage.id;
        }, 0);
      }
    }
    if (selectedConversationId !== previousConversationIdRef.current) {
        previousConversationIdRef.current = selectedConversationId;
        // When conversation changes, reset last scrolled message to ensure scroll if messages exist
        if (selectedConversation && selectedConversation.messages.length > 0) {
            lastScrolledMessageIdRef.current = selectedConversation.messages[selectedConversation.messages.length -1].id;
        } else {
            lastScrolledMessageIdRef.current = null;
        }
    }
  }, [selectedConversation?.messages, selectedConversationId, selectedConversation]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setConversations(prev => 
        prev.map(conv => conv.id === id ? { ...conv, unread: 0 } : conv)
    );
    inputRef.current?.focus();
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    const messageToSend: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user', 
      senderName: user.name,
      avatar: `https://placehold.co/40x40.png?text=${user.name.split(' ').map(n=>n[0]).join('').toUpperCase()}`,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === selectedConversationId
          ? { ...conv, messages: [...conv.messages, messageToSend] }
          : conv
      )
    );
    setNewMessage('');
    inputRef.current?.focus();

    if (selectedConversation?.id === 'bot-soporte' || (selectedConversation?.type === 'channel' && Math.random() > 0.3)) { // Simulate bot/Alice reply
      setTimeout(() => {
        const replies = [
            `He recibido tu mensaje: "${messageToSend.text.substring(0,20)}${messageToSend.text.length > 20 ? '...' : ''}". Lo estoy procesando.`,
            `Interesante lo que dices sobre "${messageToSend.text.substring(0,15)}${messageToSend.text.length > 15 ? '...' : ''}". ¿Podrías dar más detalles?`,
            `Entendido. Respecto a "${messageToSend.text.substring(0,25)}${messageToSend.text.length > 25 ? '...' : ''}", te responderé en breve.`,
            `Gracias por tu mensaje. Tomo nota de: "${messageToSend.text.substring(0,30)}${messageToSend.text.length > 30 ? '...' : ''}".`
        ];
        const botReplyText = selectedConversation.id === 'bot-soporte' 
            ? `Soy un bot, pero he entendido: "${messageToSend.text.substring(0,25)}${messageToSend.text.length > 25 ? '...' : ''}".`
            : replies[Math.floor(Math.random() * replies.length)];

        const botReply: Message = {
          id: `bot-reply-${Date.now()}`,
          sender: selectedConversation.id === 'bot-soporte' ? 'bot' : 'Alice', 
          senderName: selectedConversation.id === 'bot-soporte' ? 'Soporte IA' : 'Alice',
          avatar: selectedConversation.id === 'bot-soporte' ? 'https://placehold.co/40x40.png?text=IA' : 'https://placehold.co/40x40.png?text=A',
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setConversations(prevConvs =>
          prevConvs.map(conv =>
            conv.id === selectedConversationId
              ? { ...conv, messages: [...conv.messages, botReply] }
              : conv
          )
        );
      }, 1000 + Math.random() * 1000);
    }
  };
  
  const getInitials = (name: string = '') => {
    const parts = name.split(/[.\s()]+/); 
    let initials = parts.map(n => n[0]).join('');
    if (initials.length > 2) {
        initials = initials.substring(0,2);
    }
    return initials.toUpperCase() || 'CH';
  };


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] shadow-lg border rounded-lg">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversation List */}
        <aside className="w-full max-w-xs border-r bg-muted/30 p-0 flex flex-col">
          <div className="p-3 border-b bg-card">
            <h2 className="text-lg font-semibold text-secondary flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Canales y DMs
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <nav className="py-1.5">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors rounded-md mx-1.5 my-0.5",
                    selectedConversationId === conv.id ? "bg-primary/10 text-primary ring-1 ring-primary/50 font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Avatar className="h-7 w-7 text-xs">
                    <AvatarImage src={conv.avatar || `https://placehold.co/32x32.png?text=${getInitials(conv.name)}`} alt={conv.name} data-ai-hint="avatar channel list" />
                    <AvatarFallback>{getInitials(conv.name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{conv.name}</span>
                  {conv.unread && conv.unread > 0 && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium">
                      {conv.unread}
                    </span>
                  )}
                  {conv.type === 'channel' ? <Hash className="h-3.5 w-3.5 text-muted-foreground/70" /> : <Users className="h-3.5 w-3.5 text-muted-foreground/70" />}
                </button>
              ))}
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

              <footer className="p-3 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={`Mensaje a ${selectedConversation.type === 'channel' ? '#' : ''}${selectedConversation.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" className="btn-primary rounded-md" disabled={!newMessage.trim()}>
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


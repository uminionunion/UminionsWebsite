import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface UserPayload {
  userId: number;
  username: string;
}

interface SocketWithUser extends Socket {
    user?: UserPayload;
    anonymousId?: string;
}

// ===============================================
// TIMEZONE & ARCHIVING HELPER FUNCTIONS
// ===============================================

// Map room names to timezones
const roomTimezoneMap: Record<string, string> = {
  'SisterUnion001NewEngland-chatroom-1': 'EST',
  'SisterUnion001NewEngland-chatroom-2': 'EST',
  'SisterUnion001NewEngland-chatroom-3': 'EST',
  'SisterUnion002CentralEastCoast-chatroom-1': 'EST',
  'SisterUnion002CentralEastCoast-chatroom-2': 'EST',
  'SisterUnion002CentralEastCoast-chatroom-3': 'EST',
  'SisterUnion003SouthEast-chatroom-1': 'EST',
  'SisterUnion003SouthEast-chatroom-2': 'EST',
  'SisterUnion003SouthEast-chatroom-3': 'EST',
  'SisterUnion004TheGreatLakesAndAppalachia-chatroom-1': 'EST',
  'SisterUnion004TheGreatLakesAndAppalachia-chatroom-2': 'EST',
  'SisterUnion004TheGreatLakesAndAppalachia-chatroom-3': 'EST',
  'SisterUnion005CentralSouth-chatroom-1': 'CST',
  'SisterUnion005CentralSouth-chatroom-2': 'CST',
  'SisterUnion005CentralSouth-chatroom-3': 'CST',
  'SisterUnion006CentralNorth-chatroom-1': 'CST',
  'SisterUnion006CentralNorth-chatroom-2': 'CST',
  'SisterUnion006CentralNorth-chatroom-3': 'CST',
  'SisterUnion007SouthWest-chatroom-1': 'MST',
  'SisterUnion007SouthWest-chatroom-2': 'MST',
  'SisterUnion007SouthWest-chatroom-3': 'MST',
  'SisterUnion008NorthWest-chatroom-1': 'PST',
  'SisterUnion008NorthWest-chatroom-2': 'PST',
  'SisterUnion008NorthWest-chatroom-3': 'PST',
  'SisterUnion009International-chatroom-1': 'EST',
  'SisterUnion009International-chatroom-2': 'EST',
  'SisterUnion009International-chatroom-3': 'EST',
  'SisterUnion010TheGreatHall-chatroom-1': 'EST',
  'SisterUnion010TheGreatHall-chatroom-2': 'EST',
  'SisterUnion010TheGreatHall-chatroom-3': 'EST',
  'SisterUnion011WaterFall-chatroom-1': 'EST',
  'SisterUnion011WaterFall-chatroom-2': 'EST',
  'SisterUnion011WaterFall-chatroom-3': 'EST',
  'SisterUnion012UnionEvent-chatroom-1': 'EST',
  'SisterUnion012UnionEvent-chatroom-2': 'EST',
  'SisterUnion012UnionEvent-chatroom-3': 'EST',
  'SisterUnion013UnionSupport-chatroom-1': 'EST',
  'SisterUnion013UnionSupport-chatroom-2': 'EST',
  'SisterUnion013UnionSupport-chatroom-3': 'EST',
  'SisterUnion014UnionNews-chatroom-1': 'MST',
  'SisterUnion014UnionNews-chatroom-2': 'MST',
  'SisterUnion014UnionNews-chatroom-3': 'MST',
  'SisterUnion015UnionRadio-chatroom-1': 'MST',
  'SisterUnion015UnionRadio-chatroom-2': 'MST',
  'SisterUnion015UnionRadio-chatroom-3': 'MST',
  'SisterUnion016UnionDrive-chatroom-1': 'EST',
  'SisterUnion016UnionDrive-chatroom-2': 'EST',
  'SisterUnion016UnionDrive-chatroom-3': 'EST',
  'SisterUnion017UnionArchiveAndEducation-chatroom-1': 'EST',
  'SisterUnion017UnionArchiveAndEducation-chatroom-2': 'EST',
  'SisterUnion017UnionArchiveAndEducation-chatroom-3': 'EST',
  'SisterUnion018UnionTech-chatroom-1': 'EST',
  'SisterUnion018UnionTech-chatroom-2': 'EST',
  'SisterUnion018UnionTech-chatroom-3': 'EST',
  'SisterUnion019UnionPolitic-chatroom-1': 'EST',
  'SisterUnion019UnionPolitic-chatroom-2': 'EST',
  'SisterUnion019UnionPolitic-chatroom-3': 'EST',
  'SisterUnion020UnionSAM-chatroom-1': 'EST',
  'SisterUnion020UnionSAM-chatroom-2': 'EST',
  'SisterUnion020UnionSAM-chatroom-3': 'EST',
  'SisterUnion021UnionUkraineAndTheCrystalPalace-chatroom-1': 'EST',
  'SisterUnion021UnionUkraineAndTheCrystalPalace-chatroom-2': 'EST',
  'SisterUnion021UnionUkraineAndTheCrystalPalace-chatroom-3': 'EST',
  'SisterUnion022FestyLove-chatroom-1': 'EST',
  'SisterUnion022FestyLove-chatroom-2': 'EST',
  'SisterUnion022FestyLove-chatroom-3': 'EST',
  'SisterUnion023UnionLegal-chatroom-1': 'EST',
  'SisterUnion023UnionLegal-chatroom-2': 'EST',
  'SisterUnion023UnionLegal-chatroom-3': 'EST',
  'SisterUnion024UnionMarket-chatroom-1': 'EST',
  'SisterUnion024UnionMarket-chatroom-2': 'EST',
  'SisterUnion024UnionMarket-chatroom-3': 'EST',
  'SisterUnion025UnionArena-chatroom-1': 'EST',
  'SisterUnion025UnionArena-chatroom-2': 'EST',
  'SisterUnion025UnionArena-chatroom-3': 'EST',
  'SisterUnion026UnionTradeEnergyAndCommunityWIFI-chatroom-1': 'EST',
  'SisterUnion026UnionTradeEnergyAndCommunityWIFI-chatroom-2': 'EST',
  'SisterUnion026UnionTradeEnergyAndCommunityWIFI-chatroom-3': 'EST',
  'SisterUnion027Secret027-chatroom-1': 'EST',
  'SisterUnion027Secret027-chatroom-2': 'EST',
  'SisterUnion027Secret027-chatroom-3': 'EST',
  'SisterUnion028Sports-chatroom-1': 'EST',
  'SisterUnion028Sports-chatroom-2': 'EST',
  'SisterUnion028Sports-chatroom-3': 'EST',
  'SisterUnion029WheelsVehiclesAndeMods-chatroom-1': 'EST',
  'SisterUnion029WheelsVehiclesAndeMods-chatroom-2': 'EST',
  'SisterUnion029WheelsVehiclesAndeMods-chatroom-3': 'EST',
  'SisterUnion030HousingAndHealthcare-chatroom-1': 'EST',
  'SisterUnion030HousingAndHealthcare-chatroom-2': 'EST',
  'SisterUnion030HousingAndHealthcare-chatroom-3': 'EST',
};

// Convert timezone offset to hours
function getTimezoneOffset(timezone: string): number {
  const offsets: Record<string, number> = {
    'EST': -5,
    'CST': -6,
    'MST': -7,
    'PST': -8,
  };
  return offsets[timezone] || 0;
}

// Get timezone for a room
function getTimezoneForRoom(room: string): string {
  return roomTimezoneMap[room] || 'EST';
}

// Check if we need to archive messages (if midnight has passed in the room's timezone)
async function checkAndArchiveIfNeeded(room: string): Promise<boolean> {
  try {
    const timezone = getTimezoneForRoom(room);
    
    const resetRecord = await db
      .selectFrom('chat_reset_schedule')
      .where('room', '=', room)
      .selectAll()
      .executeTakeFirst();
    
    if (!resetRecord) {
      console.log(`[CHAT ARCHIVE] No reset record for ${room}`);
      return false;
    }

    const lastReset = new Date(resetRecord.last_reset_at);
    const now = new Date();
    
    // Get current time in the room's timezone
    const offset = getTimezoneOffset(timezone);
    const tzNow = new Date(now.getTime() + (offset * 60 * 60 * 1000));
    const tzLastReset = new Date(lastReset.getTime() + (offset * 60 * 60 * 1000));
    
    // Check if dates differ (midnight has passed)
    const nowDate = tzNow.toISOString().split('T')[0];
    const lastResetDate = tzLastReset.toISOString().split('T')[0];
    
    if (nowDate !== lastResetDate) {
      console.log(`[CHAT ARCHIVE] Archiving ${room} (${timezone})`);
      
      // Get all current messages for this room
      const messages = await db
        .selectFrom('messages')
        .where('room', '=', room)
        .selectAll()
        .execute();
      
      if (messages.length > 0) {
        // Archive them
        await db
          .insertInto('chat_message_archives')
          .values({
            room,
            archived_messages: JSON.stringify(messages),
            archived_at: new Date().toISOString(),
          })
          .execute();
        
        console.log(`[CHAT ARCHIVE] Archived ${messages.length} messages for ${room}`);
        
        // Delete messages from current table
        await db
          .deleteFrom('messages')
          .where('room', '=', room)
          .execute();
        
        console.log(`[CHAT ARCHIVE] Cleared current messages for ${room}`);
      }
      
      // Update last reset time
      await db
        .updateTable('chat_reset_schedule')
        .set({ last_reset_at: new Date().toISOString() })
        .where('room', '=', room)
        .execute();
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`[CHAT ARCHIVE] Error checking archive for ${room}:`, error);
    return false;
  }
}

// Get base room name from full room name (removes -chatroom-X)
function getBaseRoom(room: string): string {
  return room.replace(/-chatroom-\d+$/, '');
}

// ===============================================
// MAIN SETUP FUNCTION
// ===============================================

export function setupChat(io: SocketIOServer) {
  const usersInRooms: Record<string, Record<string, { username: string }>> = {};
  
  // ✅ FIXED: Track anonymous IDs per socket (assigned at connection)
  const socketAnonIds: Map<string, string> = new Map();
  
  // ✅ FIXED: Track anonymous counters PER ROOM (resets when room is empty)
  const roomAnonCounters: Map<string, number> = new Map();

  io.use(async (socket: SocketWithUser, next) => {
    // Try to get token from auth object first (most reliable)
    let token = (socket.handshake.auth as any)?.token;

    // If no token in auth, try cookie
    if (!token) {
      const cookie = socket.handshake.headers.cookie;
      if (cookie) {
        token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      }
    }

    // If no token in cookie, try Authorization header
    if (!token) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
        socket.user = payload;
        console.log(`[CHAT] User authenticated via socket: ID=${payload.userId}, Username=${payload.username}`);
        return next();
      } catch (err) {
        console.log('[CHAT] Invalid token, treating as anonymous');
      }
    }

    // ✅ FIXED: Assign a temporary placeholder - actual ID assigned per room
    socket.anonymousId = 'Anonymous_PENDING';
    console.log(`[CHAT] User joining as anonymous (pending room assignment): ${socket.id}`);
    next();
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log('A user connected:', socket.id, 'as', socket.user?.username || 'Anonymous_PENDING');
    
    socket.on('joinRoom', async (room) => {
      socket.join(room);
      
      // ✅ FIXED: Assign anonymous ID when joining room (not at connection)
      let displayName: string;
      if (socket.user) {
        // Logged-in user - use their username
        displayName = socket.user.username;
        console.log(`[CHAT] Logged-in user ${socket.user.username} joined room: ${room}`);
      } else {
        // Anonymous user - get next counter for this room
        const currentCounter = roomAnonCounters.get(room) || 0;
        const nextId = currentCounter + 1;
        roomAnonCounters.set(room, nextId);
        
        displayName = `Anonymous${String(nextId).padStart(1, '0')}`;
        socketAnonIds.set(socket.id, displayName);
        
        console.log(`[CHAT] Anonymous user ${displayName} joined room: ${room} (room counter now: ${nextId})`);
      }

      if (!usersInRooms[room]) {
        usersInRooms[room] = {};
      }
      usersInRooms[room][socket.id] = { username: displayName };
      io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
      
      // Check and archive if needed (at midnight based on timezone)
      const archived = await checkAndArchiveIfNeeded(room);
      if (archived) {
        // Notify clients that messages have been cleared
        io.to(room).emit('messagesCleared');
      }

      try {
        // Load last 50 messages from this room
        const messages = await db
          .selectFrom('messages')
          .leftJoin('users', 'users.id', 'messages.user_id')
          .where('room', '=', room)
          .orderBy('timestamp', 'asc')
          .limit(50)
          .select([
            'messages.id',
            'messages.content',
            'messages.is_anonymous',
            'messages.timestamp',
            'users.username',
            'messages.anonymous_username'
          ])
          .execute();
        
        const formattedMessages = messages.map(msg => {
          let displayUsername: string;
          
          if (msg.is_anonymous || !msg.username) {
            displayUsername = msg.anonymous_username || 'Anonymous';
          } else {
            displayUsername = msg.username;
          }
          
          return {
            id: msg.id,
            content: msg.content,
            username: displayUsername,
            is_anonymous: msg.is_anonymous,
            timestamp: msg.timestamp,
          };
        });

        socket.emit('loadMessages', formattedMessages);
      } catch (error) {
        console.error(`Error loading messages for room ${room}:`, error);
      }
    });

    // NEW: Load archived messages
    socket.on('loadArchivedMessages', async (data: { room: string; offset: number }) => {
      const { room, offset } = data;
      
      try {
        // Get archived messages for this room, ordered by date descending (most recent first)
        const archives = await db
          .selectFrom('chat_message_archives')
          .where('room', '=', room)
          .orderBy('archived_at', 'desc')
          .select(['id', 'archived_messages', 'archived_at'])
          .execute();
        
        // Skip to the offset archive batch
        const archive = archives[offset];
        
        if (archive) {
          const messages = JSON.parse(archive.archived_messages);
          
          // Format messages
          const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            username: msg.anonymous_username || 'Anonymous',
            is_anonymous: msg.is_anonymous === 1,
            timestamp: msg.timestamp,
          }));
          
          socket.emit('loadedArchivedMessages', {
            messages: formattedMessages,
            hasMore: offset < archives.length - 1,
            offset: offset + 1,
            archivedAt: archive.archived_at,
          });
        } else {
          socket.emit('loadedArchivedMessages', {
            messages: [],
            hasMore: false,
            offset: offset,
          });
        }
      } catch (error) {
        console.error(`Error loading archived messages for ${room}:`, error);
        socket.emit('error', { message: 'Failed to load archived messages' });
      }
    });

    socket.on('sendMessage', async (data: { room: string; content: string; isAnonymous: boolean }) => {
      const { room, content, isAnonymous } = data;
      
      try {
        let userId: number | null = null;
        let anonymousUsername: string | null = null;
        let isAnon = 0;
        
        // DETERMINE WHO IS SENDING THE MESSAGE
        if (socket.user) {
          // LOGGED-IN USER
          userId = socket.user.userId;
          if (isAnonymous) {
            // They clicked "Post Anonymously?" - mark as anonymous
            isAnon = 1;
            anonymousUsername = `Anonymous_${socket.user.userId}`;
          } else {
            // They did NOT click "Post Anonymously?" - post as themselves
            isAnon = 0;
            anonymousUsername = null;
          }
        } else {
          // NOT LOGGED-IN USER - Always anonymous, use the assigned room anonymous ID
          userId = null;
          isAnon = 1;
          anonymousUsername = socketAnonIds.get(socket.id) || 'Anonymous';
        }

        // Save message to database
        const newMessage = await db
          .insertInto('messages')
          .values({
            content,
            room,
            user_id: userId,
            is_anonymous: isAnon as any,
            anonymous_username: anonymousUsername,
          })
          .returningAll()
          .executeTakeFirst();

        if (newMessage) {
          // Determine display username for clients
          let displayUsername: string;
          if (isAnon === 1 && anonymousUsername) {
            displayUsername = anonymousUsername;
          } else if (socket.user) {
            displayUsername = socket.user.username;
          } else {
            displayUsername = 'Anonymous';
          }

          const messageForClient = {
            id: newMessage.id,
            content: newMessage.content,
            username: displayUsername,
            is_anonymous: isAnon === 1,
            timestamp: newMessage.timestamp,
          };

          console.log(`[CHAT] Message from: "${displayUsername}" | Anonymous: ${isAnon === 1 ? 'YES' : 'NO'} | UserID: ${userId}`);
          
          // ✅ BROADCAST MESSAGE TO ALL USERS IN THE ROOM
          io.to(room).emit('receiveMessage', messageForClient);

          // ✅ UPDATE UNREAD STATUS FOR LOGGED-IN USERS
          if (socket.user?.userId) {
            const socketsInRoom = await io.in(room).fetchSockets();
            const userIdsToUpdate = new Set<number>();
            
            socketsInRoom.forEach(s => {
              const userSocket = s as unknown as SocketWithUser;
              if (userSocket.user?.userId && userSocket.user.userId !== socket.user.userId) {
                userIdsToUpdate.add(userSocket.user.userId);
              }
            });
            
            for (const userId of userIdsToUpdate) {
              try {
                await db
                  .insertInto('chatroom_unread_status')
                  .values({
                    user_id: userId,
                    chatroom_room_name: room,
                    has_unread: 1,
                  })
                  .onConflict(oc =>
                    oc
                      .columns(['user_id', 'chatroom_room_name'])
                      .doUpdateSet({ has_unread: 1 })
                  )
                  .execute();
              } catch (err) {
                console.error(`[CHAT] Error updating unread status for user ${userId}:`, err);
              }
            }
          }

          // ✅ EMIT REAL-TIME NOTIFICATION TO ALL CONNECTED USERS
          console.log(`[CHAT] Broadcasting unread notification for room: ${room}`);
          io.emit('chatroomUnreadNotification', {
            room: room,
            hasUnread: true,
            messageCount: 1,
          });
        }
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      
      // Get display name before cleanup
      let displayName = socket.user?.username || socketAnonIds.get(socket.id) || 'Anonymous';
      console.log(`User ${displayName} left room: ${room}`);
      
      if (usersInRooms[room]) {
        delete usersInRooms[room][socket.id];
        io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
        
        // ✅ FIXED: Reset counter if room is now empty
        if (Object.keys(usersInRooms[room]).length === 0) {
          roomAnonCounters.delete(room);
          console.log(`[CHAT] Room ${room} is now empty, anonymous counter reset`);
        }
      }
    });

    socket.on('disconnect', () => {
      const displayName = socket.user?.username || socketAnonIds.get(socket.id) || 'Anonymous';
      console.log('User disconnected:', socket.id, 'as', displayName);
      
      // Clean up this socket's anonymous ID
      socketAnonIds.delete(socket.id);
      
      // Check all rooms and clean up
      for (const room in usersInRooms) {
        if (usersInRooms[room][socket.id]) {
          delete usersInRooms[room][socket.id];
          io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
          
          // ✅ FIXED: Reset counter if room is now empty
          if (Object.keys(usersInRooms[room]).length === 0) {
            roomAnonCounters.delete(room);
            console.log(`[CHAT] Room ${room} is now empty after disconnect, anonymous counter reset`);
          }
        }
      }
    });
  });
}

// Export a helper function to check if room has messages
export async function roomHasMessages(room: string): Promise<boolean> {
  try {
    const messageCount = await db
      .selectFrom('messages')
      .where('room', '=', room)
      .selectAll()
      .execute();
    
    return messageCount.length > 0;
  } catch (error) {
    console.error(`[CHAT] Error checking messages for room ${room}:`, error);
    return false;
  }
}

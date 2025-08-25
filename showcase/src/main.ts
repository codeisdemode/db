import { Columnist, defineTable } from '../../lib/index'
import { z } from 'zod'

// Define schema for our showcase app
const schema = {
  notes: defineTable()
    .column("id", "string")
    .column("title", "string")
    .column("content", "string")
    .column("createdAt", "date")
    .column("updatedAt", "date")
    .primaryKey("id")
    .searchable("title", "content")
    .indexes("createdAt")
    .validate(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      createdAt: z.date().default(() => new Date()),
      updatedAt: z.date().default(() => new Date())
    }))
    .build(),

  devices: defineTable()
    .column("deviceId", "string")
    .column("deviceName", "string")
    .column("platform", "string")
    .column("os", "string")
    .column("browser", "string")
    .column("capabilities", "json")
    .column("createdAt", "date")
    .column("lastSeen", "date")
    .primaryKey("deviceId")
    .indexes("lastSeen")
    .build()
}

// Global database instance
let db: any = null

// Initialize database
async function initDatabase() {
  try {
    db = await Columnist.init('showcase-app', { schema })
    console.log('Database initialized successfully')
    
    // Start with some demo data
    await seedDemoData()
    
    // Load initial data
    await refreshNotes()
    await refreshStats()
    await refreshDevices()
    
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

// Seed with demo data
async function seedDemoData() {
  const existingNotes = await db.getAll('notes', 1)
  if (existingNotes.length === 0) {
    await db.insert({
      title: 'Welcome to ColumnistDB',
      content: 'This is a demo note showing client-side database capabilities with full-text search and cross-device synchronization.',
      createdAt: new Date(),
      updatedAt: new Date()
    }, 'notes')
  }
}

// Notes functionality
async function addNote() {
  const title = (document.getElementById('noteTitle') as HTMLInputElement).value
  const content = (document.getElementById('noteContent') as HTMLInputElement).value
  
  if (!title || !content) return
  
  try {
    await db.insert({
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    }, 'notes')
    
    // Clear inputs
    ;(document.getElementById('noteTitle') as HTMLInputElement).value = ''
    ;(document.getElementById('noteContent') as HTMLInputElement).value = ''
    
    await refreshNotes()
    await refreshStats()
    
  } catch (error) {
    console.error('Error adding note:', error)
  }
}

async function refreshNotes() {
  const notes = await db.getAll('notes')
  const notesList = document.getElementById('notesList')
  
  if (notesList) {
    notesList.innerHTML = notes.map((note: any) => `
      <div style="margin:10px 0; padding:10px; background:#f8f9fa; border-radius:4px;">
        <h4 style="margin:0;">${note.title}</h4>
        <p style="margin:5px 0; color:#666;">${note.content}</p>
        <small style="color:#999;">${new Date(note.createdAt).toLocaleString()}</small>
        <button onclick="deleteNote('${note.id}')" style="margin-left:10px;">Delete</button>
      </div>
    `).join('')
  }
}

async function searchNotes() {
  const query = (document.getElementById('searchNotes') as HTMLInputElement).value
  
  if (!query) {
    await refreshNotes()
    return
  }
  
  try {
    console.log('Searching for:', query)
    const results = await db.search(query, { table: 'notes', limit: 50 })
    console.log('Search results:', results)
    const notesList = document.getElementById('notesList')
    
    if (notesList && results && results.length > 0) {
      notesList.innerHTML = results.map((result: any) => `
        <div style="margin:10px 0; padding:10px; background:#e8f4fd; border-radius:4px;">
          <h4 style="margin:0;">${result.title || 'Untitled'} <small style="color:#007acc;">(score: ${result.score?.toFixed(2) || '0.00'})</small></h4>
          <p style="margin:5px 0; color:#666;">${result.content || 'No content'}</p>
          <small style="color:#999;">${result.createdAt ? new Date(result.createdAt).toLocaleString() : 'Unknown date'}</small>
        </div>
      `).join('')
    } else if (notesList) {
      notesList.innerHTML = '<p style="color:#666; text-align:center;">No results found</p>'
    }
  } catch (error) {
    console.error('Error searching notes:', error)
    const notesList = document.getElementById('notesList')
    if (notesList) {
      notesList.innerHTML = '<p style="color:red;">Search error occurred</p>'
    }
  }
}

async function deleteNote(id: string) {
  try {
    await db.delete(id, 'notes')
    await refreshNotes()
    await refreshStats()
  } catch (error) {
    console.error('Error deleting note:', error)
  }
}

// Statistics
async function refreshStats() {
  try {
    const stats = await db.getStats()
    const statsElement = document.getElementById('stats')
    
    if (statsElement) {
      statsElement.innerHTML = `
        <div class="stat-card">
          <h3>${stats.tables.notes?.count || 0}</h3>
          <p>Total Notes</p>
        </div>
        <div class="stat-card">
          <h3>${Math.round((stats.overallBytes || 0) / 1024)} KB</h3>
          <p>Storage Used</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalTables}</h3>
          <p>Total Tables</p>
        </div>
      `
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Device management
async function refreshDevices() {
  try {
    const deviceManager = await db.getDeviceManager()
    const currentDevice = await deviceManager.getCurrentDevice()
    const allDevices = await deviceManager.getAllDevices()
    
    const devicesList = document.getElementById('devicesList')
    if (devicesList) {
      devicesList.innerHTML = allDevices.map((device: any) => `
        <div class="device-item ${device.deviceId === currentDevice.deviceId ? '' : 'offline'}">
          <strong>${device.deviceName}</strong> (${device.platform})
          <br>
          <small>${device.os} • ${device.browser || 'Unknown'} • Last seen: ${new Date(device.lastSeen).toLocaleString()}</small>
          ${device.deviceId === currentDevice.deviceId ? '<span style="color:#28a745; margin-left:10px;">• Current Device</span>' : ''}
        </div>
      `).join('')
    }
  } catch (error) {
    console.error('Error fetching devices:', error)
  }
}

async function startPresenceTracking() {
  try {
    await db.startDevicePresenceTracking(30000) // 30 second heartbeat
    alert('Device presence tracking started! This device will now broadcast its online status.')
  } catch (error) {
    console.error('Error starting presence tracking:', error)
  }
}

// Performance demo
async function insert1000Records() {
  const resultsElement = document.getElementById('bulkResults')
  
  try {
    const startTime = performance.now()
    
    for (let i = 0; i < 100; i++) { // Reduced to 100 for demo
      await db.insert({
        title: `Demo Note ${i}`,
        content: `This is demo note number ${i} showing bulk insert performance.`,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 'notes')
    }
    
    const endTime = performance.now()
    const duration = (endTime - startTime).toFixed(2)
    
    if (resultsElement) {
      resultsElement.innerHTML = `
        <p>✅ Inserted 100 records in ${duration}ms</p>
        <p>Average: ${(Number(duration) / 100).toFixed(2)}ms per record</p>
      `
    }
    
    await refreshNotes()
    await refreshStats()
    
  } catch (error) {
    console.error('Error in bulk insert:', error)
    if (resultsElement) {
      resultsElement.innerHTML = '<p style="color:red;">Error during bulk insert</p>'
    }
  }
}

async function subscribeToChanges() {
  const changeLog = document.getElementById('changeLog')
  
  if (changeLog) {
    changeLog.innerHTML = '<p>📡 Listening for database changes...</p>'
  }
  
  // Subscribe to note changes
  db.subscribe('notes', (event: any) => {
    if (changeLog) {
      const message = `Change detected: ${event.type} - ${event.record?.title || 'unknown'}`
      changeLog.innerHTML += `<p>${new Date().toLocaleTimeString()}: ${message}</p>`
      
      // Keep only last 5 messages
      const messages = changeLog.innerHTML.split('<p>').slice(-6)
      changeLog.innerHTML = messages.join('<p>')
    }
  })
}

// Make functions global for HTML onclick
;(window as any).addNote = addNote
;(window as any).searchNotes = searchNotes
;(window as any).deleteNote = deleteNote
;(window as any).refreshStats = refreshStats
;(window as any).refreshDevices = refreshDevices
;(window as any).startPresenceTracking = startPresenceTracking
;(window as any).insert1000Records = insert1000Records
;(window as any).subscribeToChanges = subscribeToChanges

// Initialize when page loads
initDatabase()
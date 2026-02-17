import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [],
    currentRoom: null,
    savedMaterials: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchRooms(searchQuery = '') {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      try {
        const config = authStore.token ? { headers: { 'x-auth-token': authStore.token } } : {}
        const query = searchQuery ? `?search=${searchQuery}` : ''
        const res = await axios.get(`http://localhost:5000/api/rooms${query}`, config)
        this.rooms = res.data
      } catch (err) {
        this.error = err.response?.data?.msg || 'Error fetching rooms'
      } finally {
        this.loading = false
      }
    },

    async fetchMyRooms(filter = 'joined') {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/my-rooms?filter=${filter}`, {
          headers: { 'x-auth-token': authStore.token }
        })
        this.rooms = res.data
      } catch (err) {
        this.error = err.response?.data?.msg || 'Error fetching my rooms'
      } finally {
        this.loading = false
      }
    },

    async createRoom(roomData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const formData = new FormData()
        formData.append('name', roomData.name)
        formData.append('topic', roomData.topic)
        formData.append('description', roomData.description)
        formData.append('max_capacity', roomData.max_capacity)
        if (roomData.cover_image) {
          formData.append('cover_image', roomData.cover_image)
        }

        const res = await axios.post('http://localhost:5000/api/rooms', formData, {
          headers: { 
            'x-auth-token': authStore.token,
            'Content-Type': 'multipart/form-data'
          }
        })
        this.rooms.unshift(res.data)
        return res.data
      } catch (err) {
        this.error = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to create room'
        throw err
      } finally {
        this.loading = false
      }
    },

    async getRoomById(id) {
          this.loading = true
          this.error = null
          const authStore = useAuthStore()
          try {
            // We need auth header to check membership status
            const config = authStore.token ? { headers: { 'x-auth-token': authStore.token } } : {}
            const res = await axios.get(`http://localhost:5000/api/rooms/${id}`, config)
            this.currentRoom = res.data
            return res.data
          } catch (err) {
            this.error = err.response?.data?.msg || 'Error fetching room'
            throw err
          } finally {
            this.loading = false
          }
    },
    async joinRoom(id) {
        const authStore = useAuthStore()
        try {
            await axios.post(`http://localhost:5000/api/rooms/${id}/join`, {}, {
                headers: { 'x-auth-token': authStore.token }
            })
            // Refresh room data to get updated member count
            await this.getRoomById(id)
        } catch (err) {
            throw err
        }
    },
    async leaveRoom(id) {
        const authStore = useAuthStore()
        try {
            await axios.post(`http://localhost:5000/api/rooms/${id}/leave`, {}, {
                headers: { 'x-auth-token': authStore.token }
            })
            // Refresh room data
            await this.getRoomById(id)
            await this.getRoomById(id)
        } catch (err) {
            throw err
        }
    },

    async updateRoom(id, roomData) {
        this.loading = true
        this.error = null
        const authStore = useAuthStore()
        try {
            const formData = new FormData()
            if (roomData.name) formData.append('name', roomData.name)
            if (roomData.topic) formData.append('topic', roomData.topic)
            if (roomData.description) formData.append('description', roomData.description)
            if (roomData.max_capacity) formData.append('max_capacity', roomData.max_capacity)
            if (roomData.cover_image instanceof File) {
                formData.append('cover_image', roomData.cover_image)
            }

            const res = await axios.put(`http://localhost:5000/api/rooms/${id}`, formData, {
                headers: { 
                    'x-auth-token': authStore.token,
                    'Content-Type': 'multipart/form-data'
                }
            })
            // Update local room data if it matches current room
            if (this.currentRoom && this.currentRoom.id == id) {
                this.currentRoom = { ...this.currentRoom, ...res.data }
            }
            return res.data
        } catch (err) {
            this.error = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to update room'
            throw err
        } finally {
            this.loading = false
        }
    },

    async deleteRoom(id) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      try {
        await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
          headers: { 'x-auth-token': authStore.token }
        })
        this.rooms = this.rooms.filter(room => room.id !== id)
      } catch (err) {
        this.error = err.response?.data?.msg || 'Failed to delete room'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchSavedMaterials(search = '') {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      try {
        const query = search ? `?search=${search}` : ''
        const res = await axios.get(`http://localhost:5000/api/rooms/materials/saved${query}`, {
          headers: { 'x-auth-token': authStore.token }
        })
        this.savedMaterials = res.data
      } catch (err) {
        this.error = err.response?.data?.msg || 'Error fetching saved materials'
      } finally {
        this.loading = false
      }
    },

    async toggleSaveMaterial(materialId) {
      const authStore = useAuthStore()
      try {
        const res = await axios.post(`http://localhost:5000/api/rooms/materials/${materialId}/save`, {}, {
          headers: { 'x-auth-token': authStore.token }
        })
        
        // Update local state if in savedMaterials list
        if (!res.data.is_saved) {
            this.savedMaterials = this.savedMaterials.filter(m => m.id !== materialId)
        }
        return res.data
      } catch (err) {
        throw err
      }
    },

    async clearSavedMaterials() {
      const authStore = useAuthStore()
      try {
        await axios.delete('http://localhost:5000/api/rooms/materials/saved', {
            headers: { 'x-auth-token': authStore.token }
        })
        this.savedMaterials = []
      } catch (err) {
        throw err
      }
    }
  }
})

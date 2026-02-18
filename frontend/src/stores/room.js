import { defineStore } from 'pinia'
import api from '../utils/api'
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
    async fetchRooms(searchQuery = '', sort = 'newest') {
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (sort) params.append('sort', sort)
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        
        const res = await api.get(`/api/rooms${queryString}`)
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
      try {
        const res = await api.get(`/api/rooms/my-rooms?filter=${filter}`)
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
      
      try {
        const formData = new FormData()
        formData.append('name', roomData.name)
        formData.append('topic', roomData.topic)
        formData.append('description', roomData.description)
        formData.append('max_capacity', roomData.max_capacity)
        if (roomData.cover_image) {
          formData.append('cover_image', roomData.cover_image)
        }

        const res = await api.post('/api/rooms', formData)
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
          try {
            const res = await api.get(`/api/rooms/${id}`)
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
        try {
            await api.post(`/api/rooms/${id}/join`)
            // Refresh room data to get updated member count
            await this.getRoomById(id)
        } catch (err) {
            throw err
        }
    },
    async leaveRoom(id) {
        try {
            await api.post(`/api/rooms/${id}/leave`)
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
        try {
            const formData = new FormData()
            if (roomData.name) formData.append('name', roomData.name)
            if (roomData.topic) formData.append('topic', roomData.topic)
            if (roomData.description) formData.append('description', roomData.description)
            if (roomData.max_capacity) formData.append('max_capacity', roomData.max_capacity)
            if (roomData.cover_image instanceof File) {
                formData.append('cover_image', roomData.cover_image)
            }

            const res = await api.put(`/api/rooms/${id}`, formData)
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
      try {
        await api.delete(`/api/rooms/${id}`)
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
      try {
        const query = search ? `?search=${search}` : ''
        const res = await api.get(`/api/rooms/materials/saved${query}`)
        this.savedMaterials = res.data
      } catch (err) {
        this.error = err.response?.data?.msg || 'Error fetching saved materials'
      } finally {
        this.loading = false
      }
    },

    async toggleSaveMaterial(materialId) {
      try {
        const res = await api.post(`/api/rooms/materials/${materialId}/save`)
        
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
      try {
        await api.delete('/api/rooms/materials/saved')
        this.savedMaterials = []
      } catch (err) {
        throw err
      }
    }
  }
})

import Vue from 'vue'
import Router from 'vue-router'
import ChatList from '../components/ChatList/ChatList.vue'
import Contacts from '../components/Contacts/Contacts.vue'
import Timeline from '../components/Timeline/Timeline.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '1',
      component: ChatList
    },
    {
      path: '/chatlist',
      name: '1',
      component: ChatList
    },
    {
      path: '/contacts',
      name: '2',
      component: Contacts
    },
    {
      path: '/timeline',
      name: '3',
      component: Timeline
    }
  ]
})

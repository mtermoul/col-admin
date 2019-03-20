import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import _ from 'underscore'
import cosmicStore from './modules/cosmic'

Vue.use(Vuex)
Vue.use(VueResource)
Vue.http.options.root = 'http://localhost:4000/api/generic/'

export default new Vuex.Store({
    state: {
        isDataReady: false,
        students: [],
        states: []
    },
    getters: {
        students (state) {
            return state.students
        },
        isDataReady (state) {
            return state.isDataReady
        },
        states (state) {
            return state.states
        }
    },
    mutations: {
        SET_STUDENTS (state, value) {
            state.students = value
        },
        SET_IS_DATA_READY (state, value) {
            state.isDataReady = value
        },
        ADD_STUDENTS (state, value) {
            state.students.push(...value)
        },
        SET_STATES (state, value) {
            state.states = value
        }
    },
    actions: {
        async fetchStudents ({commit, dispatch}) {
            const pageSize = 25
            let recCount = 25
            let currentPage = 1
            while(recCount >= pageSize || currentPage === 100) {
                try {
                    let response = await Vue.http.get('vwstudent?page=' + currentPage)
                    recCount = response.data.length
                    if( response.data.length > 0) {
                        commit('ADD_STUDENTS', response.data)
                        // if(!state.isDataReady) commit('SET_IS_DATA_READY', true)
                    }
                    currentPage += 1
                } catch (error) {
                    console.warn('---- REST ERROR: ', error)
                }
            }
            commit('SET_IS_DATA_READY', true)
            dispatch('fetchStates')

        },
        fetchStates ({commit, state}) {
            let states = []
            states = _.chain(state.students).pluck('state').uniq().sortBy((value) => value).value()
            commit('SET_STATES', states)
        }
    },
    modules: {
        cosmicStore
    }
})

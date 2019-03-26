import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'underscore'
import cosmicStore from './modules/cosmic'

Vue.use(Vuex)

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

import Cosmic from '../../api/cosmic' // used for Rest API
import Students from '../../../data/vwstudent.json'

const actions = {
    async importData () {
        // call this function only when you need to import data from json file to Cosmic database
        for (let student of Students) {
            console.log('--- adding student: ' + student.firstName + ' ' + student.lastName)
            let payload = {
                type_slug: 'students',
                title: `${student.firstName} ${student.lastName} ${student.id}`,
                metafields: [
                    {key: 'sid', title: 'SID', value: student.id},
                    {key: 'firstname', title: 'firstName', value: student.firstName},
                    {key: 'lastname', title: 'lastName', value: student.lastName},
                    {key: 'dob', title: 'DOB', value: student.dob},
                    {key: 'gpa', title: 'GPA', value: student.gpa},
                    {key: 'address', title: 'Address', value: student.address},
                    {key: 'city', title: 'City', value: student.city},
                    {key: 'county', title: 'County', value: student.county},
                    {key: 'state', title: 'State', value: student.state},
                    {key: 'zip', title: 'Zip', value: student.zip}
                ]
            }
            await Cosmic.addObject(payload)
        }
        console.log('----- data import completed -----')
    },
    async fetchStudents ({commit, dispatch}) {
        const recordLimit = 25
        let skipPos = 0
        let fetchMore = true

        while (fetchMore) {
            try {
                const params = {
                    type: 'students',
                    limit: recordLimit,
                    skip: skipPos
                }
                let res = await Cosmic.getObjects(params)
                if (res.objects && res.objects.length) {
                    let data = res.objects.map((item) => {
                        return {...item.metadata, id: item.metadata.sid,
                            firstName: item.metadata.firstname,
                            lastName: item.metadata.lastname }
                    })
                    commit('ADD_STUDENTS', data)
                    commit('SET_IS_DATA_READY', true)
                    // if fetched recodrs lenght is less than 25 then we have end of list
                    if (res.objects.length < recordLimit) fetchMore = false
                } else {
                    fetchMore = false
                }
                skipPos += recordLimit
            }
            catch (error) {
                console.log(error)
                fetchMore = false
            }
        }
        dispatch('fetchStates')
    }

}

export default {
    actions
}

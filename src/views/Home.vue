<template>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <v-flex xs2>
                <v-select
                    :items="filterFields"
                    v-model="filterField"
                    label="Filter by">
                </v-select>
            </v-flex>
            <v-flex xs2>
                <v-select
                    :items="filterOperators"
                    v-model="filterOperator"
                    label="Operator">
                </v-select>
            </v-flex>
            <v-flex xs2 v-show="filterOperator && filterType !== 'lookup'">
                <v-text-field
                    name="filterTerm"
                    :label="filterTermLabel"
                    :mask="filterTermMask"
                    :rules='filterTermRules'
                    return-masked-value
                    v-model="filterTerm"
                ></v-text-field>
            </v-flex>
            <v-flex xs2 v-show="filterOperator === 'between'">
                <v-text-field
                    name="filterTerm2"
                    :label="filterTermLabel"
                    :mask="filterTermMask"
                    :rules='filterTermRules'
                    return-masked-value
                    v-model="filterTerm2"
                ></v-text-field>
            </v-flex>
            <v-flex xs2 v-show="filterType === 'lookup'">
                <v-autocomplete
                  :items="filterLookupItems"
                  :label="filterLookupLabel"
                  v-model="filterLookupValue"
                ></v-autocomplete>
            </v-flex>
            <v-flex xs2>
                <v-btn color="warning" @click="onClearAllFilters">Clear All</v-btn>
            </v-flex>
            <v-flex xs12>

                <v-data-table
                    :headers="headers"
                    :items="filteredStudents"
                    xhide-actions
                    :pagination.sync="pagination"
                    :loading="!isDataReady"
                    class="elevation-1">
                    <template slot="items" slot-scope="props">
                        <td>{{ props.item.id }}</td>
                        <td>{{ props.item.firstName }}</td>
                        <td>{{ props.item.lastName }}</td>
                        <td>{{ props.item.dob | shortDate(dateFilterFormat) }}</td>
                        <td>{{ props.item.gpa | gpaFloat }}</td>
                        <td>{{ props.item.address }}</td>
                        <td>{{ props.item.city }}</td>
                        <td>{{ props.item.county }}</td>
                        <td>{{ props.item.state }}</td>
                        <td>{{ props.item.zip }}</td>
                    </template>

                    <template slot="pageText" slot-scope="props">
                        Total rows: {{ props.itemsLength }}
                    </template>

                </v-data-table>

            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import moment from 'moment'

export default {
    name: 'home',
    data () {
        return {
            headers: [
                { text: 'ID', align: 'left', sortable: false, value: 'id' },
                { text: 'First', value: 'firstName' },
                { text: 'Last', value: 'lastName' },
                { text: 'DOB', value: 'dob', dataType: 'Date' },
                { text: 'GPA', value: 'gpa' },
                { text: 'Address', value: 'address' },
                { text: 'City', value: 'city' },
                { text: 'County', value: 'county' },
                { text: 'State', value: 'state' },
                { text: 'Zip', value: 'zip' }
            ],
            pagination: {
                sortBy: 'lastName',
                rowsPerPage: -1,
            },
            filterFields: [
                {text: 'First Name', value: 'firstName', type: 'text'},
                {text: 'Last Name', value: 'lastName', type: 'text'},
                {text: 'DOB', value: 'dob', type: 'date'},
                {text: 'GPA', value: 'gpa', type: 'number'},
                {text: 'Address', value: 'address', type: 'text'},
                {text: 'City', value: 'city', type: 'text'},
                {text: 'County', value: 'county', type: 'text'},
                {text: 'Zip', value: 'zip', type: 'number'},
                {text: 'State', value: 'state', type: 'lookup'}
            ],
            filterDefs: {
                text: {contains: {display: 'Contains', function: this.filterByTextContains},
                       startsWith: {display: 'Starts with', function: this.filterByTextStartsWith}},
                number: {equal: {display: 'Equal', function: this.filterByNumberEqual, decimalPoint: 1},
                         greater: {display: 'Greater than', function: this.filterByNumberGreater, decimalPoint: 1},
                         less: {display: 'Less than', function: this.filterByNumberLess, decimalPoint: 1},
                         between: {display: 'Between', function: this.filterByNumberBetween, decimalPoint: 1}},
                date: {equal: {display: 'Equal', function: this.filterByDateEqual, format: 'MM/DD/YYYY'},
                         greater: {display: 'Greater than', function: this.filterByDateGreater, format: 'MM/DD/YYYY'},
                         less: {display: 'Less than', function: this.filterByDateLess, format: 'MM/DD/YYYY'},
                         between: {display: 'Between', function: this.filterByDateBetween, format: 'MM/DD/YYYY'}},
                lookup: {is: {display: 'Is', function: this.filterByLookupIs},
                         isNot: {display: 'Is not', function: this.filterByLookupIsNot}}
            },
            filterField: '',
            filterType: '',
            filterOperators: [],
            filterOperator: '',
            filterTerm: '',
            filterTerm2: '',
            filterTermMask: '',
            filterTermLabel: '',
            filterTermRules: [],
            dateFilterFormat: 'MM/DD/YYYY',
            filterLookupItems: [],
            filterLookupValue: '',
            filterLookupLabel: ''
        }
    },
    computed: {
        students () {
            return this.$store.getters.students
        },
        states () {
            return this.$store.getters.states
        },
        filteredStudents () {
            if( this.filterField && this.filterOperator && (this.filterTerm || this.filterLookupValue)) {
                const filterFunction = this.filterDefs[this.filterType][this.filterOperator]['function']
                if(this.filterType === 'number') {
                    const decimalPoint = this.filterDefs[this.filterType][this.filterOperator]['decimalPoint'] || 0
                    if (this.filterOperator === 'between') {
                        if (this.filterTerm && this.filterTerm2) {
                            return filterFunction(this.students, this.filterField, this.filterTerm, this.filterTerm2,  decimalPoint)
                        } else {
                            return this.students
                        }
                    } else {
                        return filterFunction(this.students, this.filterField, this.filterTerm, decimalPoint)
                    }
                } else if (this.filterType === 'date') {
                    const format = this.filterDefs[this.filterType][this.filterOperator]['format'] || this.dateFilterFormat
                    if (this.filterOperator === 'between' && this.rulesIsValidDate(this.filterTerm) && this.rulesIsValidDate(this.filterTerm2)) {
                        return filterFunction(this.students, this.filterField, this.filterTerm, this.filterTerm2, format)
                    } else if (this.filterOperator !== 'between' && this.rulesIsValidDate(this.filterTerm)) {
                        return filterFunction(this.students, this.filterField, this.filterTerm, format)
                    } else {
                        return this.students
                    }
                } else if (this.filterType === 'lookup') {
                    return filterFunction(this.students, this.filterField, this.filterLookupValue)
                } else {
                    return filterFunction(this.students, this.filterField, this.filterTerm)
                }
            } else {
                return this.students
            }
        },
        isDataReady () {
            return this.$store.getters.isDataReady
        }
    },
    watch: {
        filterField (newValue) {
            const filterType = this.filterFields.find(item => item.value === newValue).type
            if(filterType) {
                this.filterType = filterType
                this.filterOperators = this.getFilterOperators(this.filterDefs[filterType])
                this.filterOperator = this.filterOperators[0]['value']
                this.clearFilterTerms()
            } else {
                this.filterType = ''
                this.filterOperators = []
                this.filterOperator = ''
                this.clearFilterTerms()
            }
        },
        filterOperator () {
            this.clearFilterTerms()
            if (this.filterType === 'text') {
                this.filterTermMask = ''
                this.filterTermLabel = 'Filter'
            } else if (this.filterType === 'number') {
                if (this.filterField === 'gpa') {
                    this.filterTermMask = '#.#'
                    this.filterTermLabel = '#.#'
                } else if (this.filterField === 'zip') {
                    this.filterTermMask = '#####'
                    this.filterTermLabel = '#####'
                } else {
                    this.filterTermMask = '######'
                    this.filterTermLabel = '######'
                }
            } else if (this.filterType === 'date') {
                this.filterTermMask = '##/##/####'
                this.filterTermLabel = 'MM/DD/YYYY'
                this.filterTermRules = [this.rulesIsValidDate]
            } else if (this.filterType === 'lookup') {
                let lookupItems = []
                if (this.filterField === 'state') {
                    lookupItems = this.states
                    this.filterLookupLabel = 'State'
                }
                this.filterLookupItems = lookupItems
                this.filterLookupValue = ''
            }
        }
    },
    filters: {
        shortDate (value, format) {
            return moment(value).format(format)
        },
        gpaFloat (value) {
            return value.toFixed(1)
        }
    },
    methods: {
        getFilterOperators (filterDef) {
            let oprs = []
            if(filterDef) {
                for(let key in filterDef) {
                    oprs.push({text: filterDef[key]['display'], value: key})
                }
            }
            return oprs
        },
        clearFilterTerms () {
            this.filterTerm = ''
            this.filterTerm2 = ''
            this.filterTermMask = ''
            this.filterTermLabel = 'Filter'
            this.filterTermRules = []
            this.filterLookupValue = ''
            this.filterLookupItems = []
            this.filterLookupLabel = ''
        },
        rulesIsValidDate (value) {
            return moment(value, this.dateFilterFormat, true).isValid()
        },
        // ---------- Events ------------------------
        onClearAllFilters () {
            this.filterField = 'firstName'
        },
        // ---------- field filter methods ----------
        filterByTextContains (list, fieldName, fieldValue) {
            const re = new RegExp(fieldValue, 'i')
            return this.filterByRegExp(list, fieldName, fieldValue, re)
        },
        filterByTextStartsWith (list, fieldName, fieldValue) {
            const re = new RegExp('^' + fieldValue, 'i')
            return this.filterByRegExp(list, fieldName, fieldValue, re)
        },
        filterByRegExp(list, fieldName, fieldValue, regExp) {
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return regExp.test(item[fieldName])
                } else {
                    return true
                }
            })
        },
        filterByNumberEqual (list, fieldName, fieldValue, decimalPoint) {
            decimalPoint = decimalPoint || 0
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return Number(item[fieldName]).toFixed(decimalPoint) === Number(fieldValue).toFixed(decimalPoint)
                } else {
                    return true
                }
            })
        },
        filterByNumberGreater (list, fieldName, fieldValue, floatPoint, decimalPoint) {
            decimalPoint = decimalPoint || 0
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return Number(item[fieldName]).toFixed(decimalPoint) > Number(fieldValue).toFixed(decimalPoint)
                } else {
                    return true
                }
            })
        },
        filterByNumberLess (list, fieldName, fieldValue, decimalPoint) {
            decimalPoint = decimalPoint || 0
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return Number(item[fieldName]).toFixed(decimalPoint) < Number(fieldValue).toFixed(decimalPoint)
                } else {
                    return true
                }
            })
        },
        filterByNumberBetween (list, fieldName, fieldValue1, fieldValue2, decimalPoint) {
            decimalPoint = decimalPoint || 0
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return Number(item[fieldName]).toFixed(decimalPoint) >= Number(fieldValue1).toFixed(decimalPoint)
                        && Number(item[fieldName]).toFixed(decimalPoint) <= Number(fieldValue2).toFixed(decimalPoint)

                } else {
                    return true
                }
            })
        },
        filterByDateEqual (list, fieldName, fieldValue, format) {
            format = format || this.dateFilterFormat
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return moment(item[fieldName]).isSame(moment(fieldValue, format), 'day')
                } else {
                    return true
                }
            })
        },
        filterByDateGreater (list, fieldName, fieldValue, format) {
            format = format || this.dateFilterFormat
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return moment(item[fieldName]).isAfter(moment(fieldValue, format), 'day')
                } else {
                    return true
                }
            })
        },
        filterByDateLess (list, fieldName, fieldValue, format) {
            format = format || this.dateFilterFormat
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return moment(item[fieldName]).isBefore(moment(fieldValue, format), 'day')
                } else {
                    return true
                }
            })
        },
        filterByDateBetween (list, fieldName, fieldValue1, fieldValue2, format) {
            format = format || this.dateFilterFormat
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return moment(item[fieldName]).isBetween(moment(fieldValue1, format), moment(fieldValue2, format), 'day', '[]')
                } else {
                    return true
                }
            })
        },
        filterByLookupIs (list, fieldName, fieldValue) {
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return item[fieldName] === fieldValue
                } else {
                    return true
                }
            })
        },
        filterByLookupIsNot (list, fieldName, fieldValue) {
            return list.filter(item => {
                if(item[fieldName] !== undefined) {
                    return item[fieldName] !== fieldValue
                } else {
                    return true
                }
            })
        }
    },
    created () {
        this.filterField = 'firstName'
    }
}
</script>

<style>
</style>

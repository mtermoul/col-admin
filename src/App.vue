<template>
    <v-app>
        <v-toolbar app color="green accent-4">
            <v-icon>school</v-icon>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>

        <v-content>
            <router-view/>
        </v-content>

        <v-footer :fixed="fixed" app color="green accent-4">
            <span>&copy; 2017</span>
        </v-footer>
    </v-app>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
      fixed: false,
      title: 'College Query'
    }
  }
}
</script>

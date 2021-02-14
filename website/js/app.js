Vue.component('party', {
  props: ['initialdata', 'initialindex'],
  data: function() { return {
    name: this.initialdata.name,
    index: this.initialindex,
    percentage: this.initialdata.percentage,
    renaming: false,
  };},
  template: `
    <div>
      <span v-if="!renaming">{{ name }}</span>
      <span v-if="renaming">
        <input v-model="name" v-on:keyup.enter="toggleRename"></input>
      </span>
      <button v-on:click="toggleRename">
        <span v-if="!renaming">Rename</span>
        <span v-if="renaming">Done</span>
      </button>
    </div>
  `,
  methods: {
    toggleRename: function() {
      this.renaming = !this.renaming;
      if(!this.renaming) {
        this.$emit('renameparty', this.index, this.name);
      }
    }
  }
})


var app = new Vue({
  el: '#app',
  data: {
    parties: [{
      name: 'Party 1',
      percentage: 1
    }],
    n_parties: 1
  },
  methods: {
    addParty: function() {
      this.n_parties++;
      var name = "Party " + this.n_parties;
      this.parties.push({
        name: name,
        percentage: 1,
      });
      console.log(this.parties);
    },

    onRenameParty: function(index, name) {
      this.parties[index].name = name;
    }

  }
})

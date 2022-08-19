const store = Vue.reactive({
  parties: [],
  n_parties: 0,
  step: 1,
  left: false,
});


const addPartyToStore = (index) => {
  const p = {
    name: '',
    index: store.n_parties,
    renaming: false,
    degree: 5,
    percentage: 50,
    ratings: [
      {
        label: "Sono d'accordo con le idee e i principi espressi da questo partito",
        value: 5,
        enabled: true
      },
      {
        label: "Ho fiducia e stima nei confronti dei candidati",
        value: 5,
        enabled: true
      },
      {
        label: "In passato il partito si è dimostrato coerente con il proprio programma",
        value: 5,
        enabled: true
      },
      {
        label: "Approvo le alleanze elettorali del partito",
        value: 5,
        enabled: true
      },
    ]
  };
  store.parties.push(p);
  store.n_parties++;
}

addPartyToStore(0);
addPartyToStore(1);


Vue.component('party', {
  props: ['partyobj', 'step', 'lastparty'],
  template: `
    <q-expansion-item
      expand-separator
      :default-opened="false"
      :label="partyobj.name? partyobj.name: 'Partito ' + (partyobj.index + 1)"
      group="parties"
    >
      <q-card>
        <q-card-section v-if="step == 1">
          <q-input 
            v-model="partyobj.name"
            label="Nome"
            @change="$emit('renameparty', partyobj.index, partyobj.name)"
          >
          </q-input>
        </q-card-section>

        <q-card-section v-if="step == 2" v-for="(rating, idx) in partyobj.ratings">
          <p><q-badge color="secondary">{{ rating.label }}</q-badge></p>
          <div>
            <q-toggle v-model="rating.enabled" />
            <q-rating
              v-model="rating.value"
              size="2em"
              :max="10"
              :disable="!rating.enabled"
            >
            </q-rating>
            <span v-if="rating.enabled">{{ rating.value }} / 10</span>
          </div>
        </q-card-section>

        <q-card-section v-if="step == 3">
          <p><q-badge color="secondary">Voto 0-10</q-badge>&nbsp;{{ partyobj.degree }}</p>

          <q-slider
            v-model="partyobj.degree"
            :min="0"
            :step="0.1"
            :max="10"
            label
          >
          </q-slider>

        </q-card-section>

        <q-card-section v-if="step == 4">
          
          <p><q-badge color="secondary">Percentuale di probabilità</q-badge>&nbsp;{{ partyobj.percentage }}%</p>

          <q-slider
            v-model="partyobj.percentage"
            :min="0"
            :step="1"
            :max="100"
            label
            :disable="lastparty"
          >
          </q-slider>

        </q-card-section>        
      </q-card>
    </q-expansion-item>
  `,
  methods: {
  },
  watch: {
    "partyobj.ratings": {
      deep: true,
      handler: function(val) {
        // When rating is updated, compute degree as the
        // harmonic average of ratings
        var n = 0;
        var d = 0;
        for(var r of val) {
          if(r.enabled) {
            n += 1;
            d += 1 / r.value;
          }
        }
        if(n > 0) {
          this.partyobj.degree = Math.round(10 * n / d) / 10;
        } else {
          this.partyobj.degree = 0;
        }
      }
    },

    "partyobj.degree": function(value) {
      this.$emit('ondegree', this.index, value);
    },

    "partyobj.percentage": function(value) {
      this.$emit('onpercentage', this.index, value);
    }

  }
})


var app = new Vue({
  el: '#app',
  data: function() { return {
      store
    }},
  methods: {
    addParty: function() {
      addPartyToStore();
      this.recomputePercentage();
    },

    onRenameParty: function(index, name) {
      this.store.parties[index].name = name;
    },

    recomputePercentage: function() {
      var n = this.store.parties.length;
      sum = 0;
      for(var i = 0; i < n; i++) {
        sum += this.store.parties[i].degree;
      }
      if(sum > 0) {
        for(var i = 0; i < n; i++) {
          this.store.parties[i].percentage = Math.round(100 * this.store.parties[i].degree / sum);
        }
      }
    },

    onDegree: function(index, degree) {
      this.recomputePercentage();
    },

    onPercentage: function(index, percentage) {
      var parties = this.store.parties;
      var n = parties.length;
      if(index < n - 1) {
        var sum = 100;
        for(var i = 0; i < n - 1; i++) {
          sum -= parties[i].percentage;
        }
        parties[n - 1].percentage = sum;
      }
    },

    onVote: function() {
      this.$q.dialog({
        title: 'Prendi una decisione',
        message: 'Prima di continuare prendi una decisione: questa estrazione è una prova, oppure è la tua estrazione definitiva? Nel secondo caso, attienti al risultato!',
        persistent: true
      }).onOk(() => {
        this.extract();
      })
    },

    extract: function() {
      var r = Math.random() * 100;
      var sum = 0;
      var i = 0;
      for(var p of this.store.parties) {
        i += 1;
        var next = sum + p.percentage;
        if (next > r) {
          this.$q.dialog({
            title: 'Estrazione',
            message: p.name? p.name: 'Partito ' + i,
            persistent: true
          })
          break;
        }
        sum = next;
      }
    }

  }
})

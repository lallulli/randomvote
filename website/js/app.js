Vue.component('party', {
  props: ['initialdata', 'initialindex', 'step', 'lastparty'],
  data: function() { return {
    name: this.initialdata.name,
    index: this.initialindex,
    percentage: this.initialdata.percentage,
    renaming: false,
    degree: 5,
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
      }
    ]
  };},
  template: `
    <q-expansion-item
      expand-separator
      :default-opened="index == 0"
      :label="name"
      group="parties"
    >
      <q-card>
        <q-card-section v-if="step == 1">
          <q-input 
            v-model="name"
            label="Name"
            @change="$emit('renameparty', index, name)"
          >
          </q-input>
        </q-card-section>

        <q-card-section v-if="step == 2" v-for="(rating, idx) in ratings">
          <p><q-badge color="secondary">{{rating.label}}</q-badge></p>
          <div>
            <q-toggle v-model="rating.enabled" />
            <q-rating
              v-model="rating.value"
              size="2em"
              :max="10"
              :disable="!rating.enabled"
            >
            </q-rating>
            <span v-if="rating.enabled">{{rating.value}} / 10</span>
          </div>
        </q-card-section>

        <q-card-section v-if="step == 3">
          <p><q-badge color="secondary">Voto 0-10</q-badge>&nbsp;{{ degree }}</p>

          <q-slider
            v-model="degree"
            :min="0"
            :step="0.1"
            :max="10"
            label
          >
          </q-slider>

        </q-card-section>

        <q-card-section v-if="step == 4">
          
          <p><q-badge color="secondary">Percentuale di probabilità</q-badge>&nbsp;{{ percentage }}%</p>

          <q-slider
            v-model="percentage"
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
    ratings: {
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
          this.degree = Math.round(10 * n / d) / 10;
        } else {
          this.degree = 0;
        }
      }
    },

    degree: function(value) {
      this.$emit('ondegree', this.index, value);
    },

    percentage: function(value) {
      this.$emit('onpercentage', this.index, value);
    }

  }
})


var app = new Vue({
  el: '#app',
  data: {
    parties: [{
      name: 'Party 1',
      percentage: 1,
    }],
    n_parties: 1,
    step: 1,
    left: false
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
    },

    onDegree: function(index, degree) {
      this.parties[index].degree = degree;
      console.log(index);
      console.log(degree);
    },

    onPercentage: function(index, percentage) {
      this.parties[index].percentage = percentage;
      console.log(percentage);
    }

  }
})

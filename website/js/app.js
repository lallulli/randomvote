Vue.component('party', {
  props: ['initialdata', 'initialindex', 'step', 'lastparty', 'percentage'],
  data: function() { return {
    name: this.initialdata.name,
    index: this.initialindex,
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
      name: 'Partito 1',
      degree: 5,
      percentage: 1,
    },
    {
      name: 'Partito 2',
      degree: 5,
      percentage: 1,
    }
    ],
    n_parties: 2,
    step: 1,
    left: false
  },
  methods: {
    addParty: function() {
      this.n_parties++;
      var name = "Partito " + this.n_parties;
      this.parties.push({
        name: name,
        degree: 5,
        percentage: 1,
      });
      console.log(this.parties);
    },

    onRenameParty: function(index, name) {
      this.parties[index].name = name;
    },

    onDegree: function(index, degree) {
      this.parties[index].degree = degree;
      var n = this.parties.length;
      sum = 0;
      for(var i = 0; i < n; i++) {
        sum += this.parties[i].degree;
      }
      if(sum > 0) {
        for(var i = 0; i < n; i++) {
          this.parties[i].percentage = Math.round(100 * this.parties[i].degree / sum);
        }
      }
    },

    onPercentage: function(index, percentage) {
      var parties = this.parties;
      parties[index].percentage = percentage;
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
        title: 'Avviso',
        message: 'Would you like to turn on the wifi?',
        persistent: true
      }).onOk(() => {
        this.extract();
      })
    },

    extract: function() {
      var r = Math.random() * 100;
      var sum = 0;
      for(var p of this.parties) {
        var next = sum + p.percentage;
        if (next > r) {
          this.$q.dialog({
            title: 'Estrazione',
            message: p.name,
            persistent: true
          })
          break;
        }
        sum = next;
      }
    }

  }
})

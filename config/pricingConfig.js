const PRICING_CONFIG = {
  SUBSCRIPTIONS: {
    PLUS: {
      price: 3.99,
      generations: 10,
    },
    PRO: {
      price: 6.99,
      generations: 20,
    },
    PRIME: {
      price: 11.99,
      generations: 40,
    },
  },

  CREDITS: {
    SINGLE: {
      price: 0.59,
      generations: 1,
    },
    MINI: {
      price: 1.69,
      generations: 3,
    },
    BASIC: {
      price: 2.79,
      generations: 5,
    },
    POWER: {
      price: 4.99,
      generations: 10,
    },
  },
};

module.exports = PRICING_CONFIG;
@use '../utils/functions' as f;
@use '../utils/mixins' as m;
@use '../utils/shadows' as s;

.cartItem {
  padding: f.r(12) f.r(4); /* Slightly increased padding for better spacing */
  margin-top: f.r(12);
  background-color: #fff; /* White background for contrast */
  border-radius: f.r(8); /* Rounded corners for card-like appearance */
  box-shadow: s.$subtle; /* Subtle shadow for depth */

  .main-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-inline: f.r(8);
    gap: f.r(12); /* Added gap for better spacing */

    .img-quantity-wrapper {
      display: flex;
      flex-direction: column;
      gap: f.r(12);
      align-items: center; /* Center items for better mobile layout */

      img {
        width: f.r(100);
        height: f.r(120);
        object-fit: cover;
        border-radius: f.r(6); /* Rounded corners for image */
        transition: transform 0.3s ease; /* Subtle zoom on hover */

        .imageLink:hover & {
          transform: scale(1.05); /* Slight zoom effect */
        }
      }

      label {
        font-size: f.r(14);
        font-weight: 500;
        color: #333; /* Darker color for better contrast */
        margin-bottom: f.r(4);
      }

      .quantity {
        display: flex;
        align-items: center;
        border: f.r(1) solid #ccc; /* Lighter, thinner border */
        border-radius: f.r(8); /* Softer corners */
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle shadow */
        background-color: var(--neutral-white); /* White background */
        width: f.r(120); /* Fixed width for consistency */
        height: f.r(36); /* Taller for better touch target */
        overflow: hidden; /* Prevent content overflow */

        input {
          flex: 1;
          border: none; /* Remove inner border */
          border-radius: 0; /* No radius for input */
          font-size: f.r(14);
          text-align: center; /* Center text */
          background-color: transparent; /* Transparent to blend with container */
          color: #333;
          height: 100%; /* Full height */
          padding: 0; /* Remove padding for alignment */

          &:focus {
            outline: none;
            box-shadow: inset 0 0 0 f.r(2) rgba(246, 139, 30, 0.3); /* Subtle focus ring */
          }
        }

        button {
          display: flex;
          justify-content: center;
          align-items: center;
          width: f.r(36); /* Square buttons */
          height: 100%;
          background-color: var(--neutral-white);
          border: none;
          cursor: pointer;
          font-size: f.r(14);
          color: var(--accent-primary); /* Use accent color */
          transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;

          &:hover {
            background-color: var(--accent-primary); /* Hover effect */
            color: var(--neutral-white);
            transform: scale(1.1); /* Subtle zoom */
          }

          &:focus {
            outline: none;
            box-shadow: 0 0 0 f.r(2) rgba(246, 139, 30, 0.3);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            color: #999;
          }
        }

        .increase-quantity {
          border-left: f.r(1) solid #ccc; /* Lighter divider */
          border-radius: 0 f.r(8) f.r(8) 0;
        }

        .reduce-quantity {
          border-right: f.r(1) solid #ccc; /* Lighter divider */
          border-radius: f.r(8) 0 0 f.r(8);
        }
      }
    }

    .productTitle-prices-wrapper {
      display: flex;
      flex-direction: column;
      gap: f.r(12); /* Reduced gap for mobile */
      flex: 1; /* Take remaining space */

      .productTitle {
        font-size: f.r(16);
        font-weight: 500;
        margin: 0; /* Remove default margins */
      }

      .titleLink {
        color: var(--text-primary);
        text-decoration: none; /* Ensure no underline */
        transition: color 0.3s ease;

        &:hover {
          color: var(--accent-primary); /* Hover effect */
        }
      }
    }

    .prices {
      display: flex;
      flex-direction: column;
      gap: f.r(4);

      .totalPrice {
        font-weight: 600;
        font-size: f.r(18); /* Slightly smaller for mobile */
        color: #333;
      }

      .unitPrice {
        font-weight: 500;
        font-size: f.r(14);
        color: #666; /* Softer gray */
      }

      .badge {
        font-size: f.r(12);
        color: var(--accent-primary);
        display: flex;
        align-items: center;
        gap: f.r(4);

        svg {
          font-size: f.r(12);
        }
      }
    }
  }

  .errorText {
    font-size: f.r(12);
    color: #dc3545;
    margin-top: f.r(8);
    margin-bottom: f.r(4);
  }

  hr {
    height: f.r(1);
    background-color: var(--accent-primary);
    border: none; /* Remove default border */
    margin: f.r(12) 0;
  }

  .actions-wrapper {
    .actions {
      display: flex;
      justify-content: space-between; /* Better spacing */
      gap: f.r(8);
      padding: 0 f.r(8);

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: f.r(6);
        flex: 1;
        background: none;
        border: f.r(1) solid var(--accent-primary);
        color: var(--accent-primary);
        font-size: f.r(14);
        font-weight: 500;
        padding: f.r(8) f.r(12);
        border-radius: f.r(6);
        transition: color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease, transform 0.2s ease;

        &:hover {
          border-color: var(--accent-secondary);
          background-color: var(--accent-secondary);
          color: var(--neutral-white);
          transform: translateY(-2px); /* Subtle lift effect */
        }

        &:focus {
          outline: none;
          box-shadow: 0 0 0 f.r(2) rgba(246, 139, 30, 0.3);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        svg {
          font-size: f.r(14);
        }
      }

      .remove {
        border-color: #dc3545; /* Red for remove button */
        color: #dc3545;

        &:hover {
          background-color: #dc3545;
          color: var(--neutral-white);
        }
      }
    }
  }
}

/* Breakpoint: 768px (Tablet) */
@media (min-width: 768px) {
  .cartItem {
    padding: f.r(16) f.r(8);
    margin-top: f.r(16);

    .main-wrapper {
      padding-inline: f.r(12);
      gap: f.r(16);

      .img-quantity-wrapper {
        flex-direction: row; /* Horizontal layout */
        align-items: center;
        gap: f.r(16);

        img {
          width: f.r(120);
          height: f.r(140);
        }

        .quantity {
          width: f.r(140);
          height: f.r(40);

          input {
            font-size: f.r(16);
          }

          button {
            width: f.r(40);
            font-size: f.r(16);
          }
        }
      }

      .productTitle-prices-wrapper {
        gap: f.r(16);

        .productTitle {
          font-size: f.r(18);
        }
      }

      .prices {
        .totalPrice {
          font-size: f.r(20);
        }

        .unitPrice {
          font-size: f.r(16);
        }

        .badge {
          font-size: f.r(14);
          svg {
            font-size: f.r(14);
          }
        }
      }
    }

    .actions-wrapper {
      .actions {
        padding: 0 f.r(12);
        gap: f.r(12);

        button {
          font-size: f.r(15);
          padding: f.r(10) f.r(16);
        }
      }
    }
  }
}

/* Breakpoint: 992px (Small Desktop) */
@media (min-width: 992px) {
  .cartItem {
    padding: f.r(20) f.r(12);
    max-width: f.r(900); /* Constrain width */
    margin-left: auto;
    margin-right: auto;

    .main-wrapper {
      padding-inline: f.r(16);
      gap: f.r(20);

      .img-quantity-wrapper {
        gap: f.r(20);

        img {
          width: f.r(140);
          height: f.r(160);
        }

        .quantity {
          width: f.r(160);
          height: f.r(44);

          input {
            font-size: f.r(18);
          }

          button {
            width: f.r(44);
            font-size: f.r(18);
          }
        }
      }

      .productTitle-prices-wrapper {
        .productTitle {
          font-size: f.r(20);
        }
      }

      .prices {
        .totalPrice {
          font-size: f.r(22);
        }

        .unitPrice {
          font-size: f.r(18);
        }
      }
    }

    .actions-wrapper {
      .actions {
        gap: f.r(16);

        button {
          font-size: f.r(16);
          padding: f.r(12) f.r(20);
        }
      }
    }
  }
}

/* Breakpoint: 1200px (Large Desktop) */
@media (min-width: 1200px) {
  .cartItem {
    padding: f.r(24) f.r(16);
    max-width: f.r(1000);

    .main-wrapper {
      padding-inline: f.r(20);
      gap: f.r(24);

      .img-quantity-wrapper {
        img {
          width: f.r(160);
          height: f.r(180);
        }

        .quantity {
          width: f.r(180);
          height: f.r(48);

          input {
            font-size: f.r(20);
          }

          button {
            width: f.r(48);
            font-size: f.r(20);
          }
        }
      }

      .productTitle-prices-wrapper {
        .productTitle {
          font-size: f.r(22);
        }
      }

      .prices {
        .totalPrice {
          font-size: f.r(24);
        }

        .unitPrice {
          font-size: f.r(20);
        }

        .badge {
          font-size: f.r(16);
          svg {
            font-size: f.r(16);
          }
        }
      }
    }

    .actions-wrapper {
      .actions {
        padding: 0 f.r(16);
        gap: f.r(20);

        button {
          font-size: f.r(18);
          padding: f.r(14) f.r(24);
        }
      }
    }
  }
}

/* Breakpoint: 1400px (Extra Large Desktop) */
@media (min-width: 1400px) {
  .cartItem {
    padding: f.r(28) f.r(20);
    max-width: f.r(1200); /* Constrain width for large screens */
    margin-left: auto;
    margin-right: auto;

    .main-wrapper {
      padding-inline: f.r(24);
      gap: f.r(28);

      .img-quantity-wrapper {
        gap: f.r(24);

        img {
          width: f.r(180);
          height: f.r(200);
        }

        .quantity {
          width: f.r(200);
          height: f.r(52);

          input {
            font-size: f.r(22);
          }

          button {
            width: f.r(52);
            font-size: f.r(22);
          }
        }
      }

      .productTitle-prices-wrapper {
        .productTitle {
          font-size: f.r(24);
        }
      }

      .prices {
        .totalPrice {
          font-size: f.r(26);
        }

        .unitPrice {
          font-size: f.r(22);
        }

        .badge {
          font-size: f.r(18);
          svg {
            font-size: f.r(18);
          }
        }
      }
    }

    .actions-wrapper {
      .actions {
        gap: f.r(24);

        button {
          font-size: f.r(20);
          padding: f.r(16) f.r(28);
        }
      }
    }
  }
}
;; Smart Contract: P2P Lending with AI Credit Score - Clarity Language

(define-constant ERR-INVALID-LOAN (err u100))
(define-constant ERR-NOT-AUTHORIZED (err u101))
(define-constant ERR-LOAN-CLOSED (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-ALREADY-APPLIED (err u104))
(define-constant ERR-INVALID-CREDIT-SCORE (err u105))
(define-constant ERR-NOT-DUE (err u106))

(define-data-var loan-id-counter uint u0)

(define-map loans
  { loan-id: uint }
  {
    lender: principal,
    borrower: (optional principal),
    amount: uint,
    interest: uint, ;; Percentage (e.g., 500 = 5%)
    duration: uint, ;; in blocks
    credit-score: uint,
    is-funded: bool,
    is-repaid: bool,
    start-block: (optional uint)
  }
)

;; Create a loan offer
(define-public (create-loan (amount uint) (interest uint) (duration uint))
  (let ((loan-id (var-get loan-id-counter)))
    (if (or (is-eq amount u0) (is-eq duration u0))
      ERR-INVALID-AMOUNT
      (begin
        (map-set loans { loan-id: loan-id } {
          lender: tx-sender,
          borrower: none,
          amount: amount,
          interest: interest,
          duration: duration,
          credit-score: u0,
          is-funded: false,
          is-repaid: false,
          start-block: none
        })
        (var-set loan-id-counter (+ loan-id u1))
        (ok loan-id)
      )
    )
  )
)

;; Borrower applies with AI-provided credit score
(define-public (apply-loan (loan-id uint) (credit-score uint))
  (let ((loan (unwrap! (map-get? loans { loan-id: loan-id }) ERR-INVALID-LOAN)))
    (if (not (is-eq (get borrower loan) none))
      ERR-ALREADY-APPLIED
      (if (or (< credit-score u300) (> credit-score u900))
        ERR-INVALID-CREDIT-SCORE
        (begin
          (map-set loans { loan-id: loan-id } (merge loan {
            borrower: (some tx-sender),
            credit-score: credit-score,
            is-funded: true,
            start-block: (some block-height)
          }))
          ;; Simulate fund transfer (production integrate STX transfer)
          (ok true)
        )
      )
    )
  )
)

;; Borrower repays loan
(define-public (repay-loan (loan-id uint) (repay-amount uint))
  (let (
    (loan (unwrap! (map-get? loans { loan-id: loan-id }) ERR-INVALID-LOAN))
    (borrower (get borrower loan))
    (total-amount (+ (get amount loan) (/ (* (get amount loan) (get interest loan)) u10000)))
  )
    (if (not (is-eq borrower (some tx-sender)))
      ERR-NOT-AUTHORIZED
      (if (get is-repaid loan)
        ERR-LOAN-CLOSED
        (if (< repay-amount total-amount)
          ERR-INVALID-AMOUNT
          (begin
            ;; Simulate repayment transfer
            (map-set loans { loan-id: loan-id } (merge loan { is-repaid: true }))
            (ok true)
          )
        )
      )
    )
  )
)

;; Lender liquidates loan after duration if unpaid
(define-public (liquidate-loan (loan-id uint))
  (let (
    (loan (unwrap! (map-get? loans { loan-id: loan-id }) ERR-INVALID-LOAN))
    (start (unwrap! (get start-block loan) ERR-NOT-DUE))
  )
    (if (not (is-eq (get lender loan) tx-sender))
      ERR-NOT-AUTHORIZED
      (if (get is-repaid loan)
        ERR-LOAN-CLOSED
        (if (< block-height (+ start (get duration loan)))
          ERR-NOT-DUE
          (begin
            ;; Simulate liquidation (collateral seizure in production)
            (map-set loans { loan-id: loan-id } (merge loan { is-repaid: true }))
            (ok true)
          )
        )
      )
    )
  )
)

;; Read-only: Get loan info
(define-read-only (get-loan (loan-id uint))
  (map-get? loans { loan-id: loan-id })
)

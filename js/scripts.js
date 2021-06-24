$(document).ready(function () {
  const newAccount = new Account();
  var balance = 0;

  $("form#transact").submit(function (event) {
    event.preventDefault();
    var inputtedAccountName = $("input#account-name").val(),
      inputtedInitialDeposit = $("input#initial-deposit").val(),
      inputtedTransactionType = $("select#transaction-type").val(),
      inputtedWithdrawalAmount = $("input#withdrawal-amount").val(),
      formAction = $("input#action").val(),
      validationFields = [],
      transactionTimestamp = new Date($.now()),
      transactionDate =
        transactionTimestamp.getDate() +
        "-" +
        transactionTimestamp.getMonth() +
        "-" +
        transactionTimestamp.getFullYear();

    if (formAction === "create-new-account") {
      validationFields.push("account-name", "initial-deposit");
      var validate = validateUserInput(validationFields, "form-alerts");
      if (validate) {
        newAccount.accountName = inputtedAccountName;
        newAccount.initialAmount = inputtedInitialDeposit;

        balance = inputtedInitialDeposit;
        $(".account-details")
          .empty()
          .html(
            '<div class="account-summary"> <ul> <li>Account Name: <span>' +
              inputtedAccountName +
              '</span></li> <li class="available-balance">Available balance: <span>' +
              formatCurrency(balance) +
              '</span></li> </ul> </div><div class="row"> <div class="col-md-6"> <div class="form-group"> <select name="" id="transaction-type" class="form-control"> <option value="">Select transaction</option> <option value="deposit">Deposit</option> <option value="withdrawal">Withdrawal</option> </select> </div> </div> <div class="col-md-6 account-transactions"> <div class="form-group"> <input class="form-control" type="text" name="" id="withdrawal-amount" placeholder="Enter Amount..." /> </div> </div> </div>'
          );

        var tableRow =
          '<tr><th scope="row" class="transaction-row"></th> <td>' +
          transactionDate +
          '</td> <td>Deposit on account opening</td><td class="align-right">' +
          formatCurrency(inputtedInitialDeposit) +
          '</td> <td class="align-right">' +
          formatCurrency(inputtedInitialDeposit) +
          "</td> </tr>";
        $(".account-statement")
          .empty()
          .html(
            '<table class="table table-striped" id="account-transactions"> <thead> <tr> <th scope="col">#</th> <th scope="col">Date</th> <th scope="col">Detail</th> <th scope="col" class="align-right">Amount</th> <th scope="col" class="align-right">Balance</th> </tr> </thead> <tbody>' +
              tableRow +
              "</tbody> </table>"
          );

        $(".stub-header").text("Deposit or Withdraw Funds");
        $(".add-new-account").addClass("hide-div");
        $("input#action").val("account-transactions");
        $("button#submit-transact").text("Post Transaction");
        resetFieldValues(validationFields);
      }
    } else if (formAction === "account-transactions") {
      validationFields.push("transaction-type", "withdrawal-amount");
      var validate = validateUserInput(validationFields, "form-alerts"),
        amount = "",
        narrative = "",
        error = false;

      if (validate) {
        if (inputtedTransactionType === "deposit") {
          newAccount.deposits.push(inputtedWithdrawalAmount);
          amount = inputtedWithdrawalAmount;
          narrative = "Deposit";
        } else if (inputtedTransactionType === "withdrawal") {
          amount = inputtedWithdrawalAmount;

          if (parseFloat(amount) > balance) {
            error = true;
            alertUser("You do not have enough funds!", "form-alerts");
          } else {
            newAccount.withdrawals.push(inputtedWithdrawalAmount);
            narrative = "Withdrawal";
            amount = amount * -1;
          }
        }

        if (!error) {
          balance = newAccount.balance();
          $(".available-balance").text(
            "Available balance: " + formatCurrency(balance)
          );
          $("#account-transactions > tbody").append(
            '<tr><th scope="row" class="transaction-row"></th> <td>' +
              transactionDate +
              "</td> <td>" +
              narrative +
              '</td><td class="align-right">' +
              formatCurrency(amount) +
              '</td> <td class="align-right">' +
              formatCurrency(balance) +
              "</td> </tr>"
          );
          resetFieldValues(validationFields);
        }
      }
    }

    autoNumberTableRows("account-transactions", "transaction-row");
  });
});

function Account() {
  this.accountName = "";
  this.initialAmount = "";
  this.deposits = [];
  this.withdrawals = [];
}

Account.prototype.balance = function () {
  var cashIn = parseFloat(this.initialAmount),
    cashOut = 0,
    balance = 0;

  this.deposits.forEach(function (deposit) {
    cashIn = cashIn + parseFloat(deposit);
  });

  this.withdrawals.forEach(function (withdrawal) {
    cashOut = cashOut + parseFloat(withdrawal);
  });

  balance = cashIn - cashOut;

  return balance;
};

function validateUserInput(formInputFields, alertDivClass) {
  var validated = true;
  $(".validate").removeClass("validate");

  formInputFields.forEach((formInputField) => {
    var field = formInputField,
      thisField = $("#" + field),
      value = thisField.val();
    if (value === "") {
      validated = false;
      thisField.addClass("validate");

      alertUser("Fill the missing fields!", alertDivClass);
    }
  });

  return validated;
}

function formatCurrency(amount) {
  return parseFloat(amount, 10)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
    .toString();
}

function resetFieldValues(formInputFields) {
  formInputFields.forEach(function (formInputField) {
    $("#" + formInputField).val("");
  });
}

function alertUser(message, alertDivClass) {
  $("." + alertDivClass).html(message);
  $("." + alertDivClass)
    .removeClass("hide-alert")
    .addClass("alert-danger");

  setTimeout(() => {
    $("." + alertDivClass).empty();
    $("." + alertDivClass)
      .removeClass("alert-danger")
      .addClass("hide-alert");
  }, 2500);
}

function autoNumberTableRows(tableId, rowClass) {
  console.log(rowClass);
  var renum = 1;
  $("#" + tableId + " > tbody tr ." + rowClass).each(function () {
    $(this).text(renum);
    renum++;
  });
}

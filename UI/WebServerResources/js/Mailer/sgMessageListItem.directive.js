/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {

  /**
   * sgMessageListItem - A directive that watches some attributes of a message. Any component inside the
   * list item should depends on this directive and extend the 'onUpdate' method instead of creating new
   * independent watchers.
   * @memberof SOGo.MailerUI
  */
  function sgMessageListItem() {
    return {
      restrict: 'C',
      scope: {},
      bindToController: {
        message: '=sgMessage'
      },
      controller: 'sgMessageListItemController'
    };
  }

  /**
   * @ngInject
   */
  sgMessageListItemController.$inject = ['$scope', '$element', '$timeout', 'Mailbox'];
  function sgMessageListItemController($scope, $element, $timeout, Mailbox) {
    var $ctrl = this;
    var scrollPosition = 0;

    this.$onInit = function () {
      var watchedAttrs = ['uid', 'isread', 'isflagged', 'flags', 'loading'];

      // this.service = Message;
      this.MailboxService = Mailbox;

      if (Mailbox.selectedFolder.type == 'draft' || Mailbox.selectedFolder.type == 'templates')
        watchedAttrs.push('subject');

      $scope.$watch(
        function() {
          return $ctrl.message? [ _.pick($ctrl.message, watchedAttrs) ] : null;
        },
        function(newId, oldId) {
          if ($ctrl.message) {
            // Message has changed
            $ctrl.onUpdate();
          }
        },
        true // compare for object equality
      );
    };


    this.onUpdate = function () {
      if (this.message.loading) {
        $element.addClass('sg-skeleton');
        return;
      }
      $element.removeClass('sg-skeleton');
      // Is the message unread?
      if (this.message.isread)
        $element.removeClass('unread');
      else
        $element.addClass('unread');
      // Is the message selected?
      if (Mailbox.selectedFolder.isSelectedMessage(this.message.uid, this.message.$mailbox.path))
        $element.addClass('md-default-theme md-accent md-bg md-hue-2');
      else
        $element.removeClass('md-default-theme md-accent md-bg md-hue-2');
    };


    this.setVisibility = function (element, visible) {
      if (visible)
        element.classList.remove('ng-hide');
      else
        element.classList.add('ng-hide');
    };

    // The following functions are used to store and restore the scroll position of the message list
    // Position is stored and restored through the Mailbox service using broadcasting
    function storeScrollPosition() {
      if ($element.parent()[0] && $element.parent()[0].parentElement && $element.parent()[0].parentElement.parentElement)
        scrollPosition = $element.parent()[0].parentElement.parentElement.scrollTop;
    }

    function restoreScrollPosition() {
      $timeout(function () {
        if ($element.parent()[0] && $element.parent()[0].parentElement && $element.parent()[0].parentElement.parentElement)
          $element.parent()[0].parentElement.parentElement.scrollTop = scrollPosition;
      }, 0);
    }

    $scope.$on('listRefreshed', function () {
      restoreScrollPosition();
    });

    $scope.$on('beforeListRefresh', function () {
      storeScrollPosition();
    });

  }


  angular
    .module('SOGo.MailerUI')
    .controller('sgMessageListItemController', sgMessageListItemController)
    .directive('sgMessageListItem', sgMessageListItem);
})();

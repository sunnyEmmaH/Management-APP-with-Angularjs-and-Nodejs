var app = angular.module('myApp', ['ngRoute', 'infinite-scroll', 'ngMaterial', 'ngFileUpload', 'ngImgCrop']);
app.service('myService', function ($http) {

	this.getEmp = function($scope) {
		$http.get("API/emp/")
          .then(function(response) {
              $scope.emps = response.data;
      	}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	};

	this.getEmpById = function($scope) {
		$http.get("API/emp/" + $scope.id)
          .then(function(response) {
              $scope.emps = response.data;
              if($scope.emps.manager == 'not assigned') return;

              	$http.get("API/emp/" + $scope.emps.manager)
		          .then(function(response) {
		              $scope.emps.manager = response.data;
		              if(response.data != undefined) $scope.hasManager = true;
		      	}, function errorCallback(response) {});

      	}, function errorCallback(response) {});
	}

	this.getNextEmp = function($scope) {
		if ($scope.busy) return;
    		$scope.busy = true;
		console.log($scope);

		var id = ($scope.emps != undefined) ? $scope.emps[$scope.emps.length - 1]._id : undefined;

		$http.get("API/emp/" + id + "/next/")
          .then(function(response) {
          	  if(response.data.length < 10) $scope.done = true;
              $scope.emps = ($scope.emps != undefined) ? $scope.emps.concat(response.data) : response.data;
              $scope.busy = false;

              $scope.emps.forEach(function(emp) {
              	$http.get("API/emp/" + emp._id + "/dirReports/")
		          .then(function(response) {
		           			emp.dirReports = response.data;
		      	}, function errorCallback(response) {});
              });

      	}, function errorCallback(response) {});
	};

	this.getDirReports = function($scope) {
		$http.get("API/emp/" + $scope.id + "/dirReports/")
          .then(function(response) {
              $scope.dirReports = response.data;
              
              $scope.dirReports.forEach(function(emp) {
              	$http.get("API/emp/" + emp._id + "/dirReports/")
		          .then(function(response) {
		           			emp.dirReports = response.data;
		      	}, function errorCallback(response) {});
              });

      	}, function errorCallback(response) {
		});
	};

	this.getAvailableManager = function(id, $scope) {
		console.log("in service getAvailableManager");
		console.log($scope);
		$http.get("API/emp/" + id + "/managers/")
          .then(function(response) {
              $scope.availableManagers = response.data;
      	}, function errorCallback(response) {});
	};

	this.deleteEmp = function(id) {
		console.log("in service deleteEmp");
		console.log(id);

		$http.delete("API/emp/" + id)
		   .then(function(response) {
		   		console.log(response);

		   		$http.get("API/emp/" + id + "/dirReports/")
		          .then(function(response) {
		              response.data.forEach(function(emp) {
		              	var updates = { manager : "not assigned" };
		              	console.log(updates);
		              	$http.put('API/emp/' + emp._id, updates)
							.then(function(response) {
								console.log("updated dirReports employees");
							}, function errorCallback(response) {});
		              });

		      	}, function errorCallback(response) {});

		    }, function errorCallback(response) {});
	};

	this.updateEmp = function($scope) {
		console.log("in service updateEmp");
		console.log($scope);

		var data = {
	            name : $scope.emps.name, 
	            tittle : $scope.emps.tittle,
	            age : $scope.emps.age,
	            gender : $scope.emps.gender,
	            manager : $scope.emps.manager,
	            phone : $scope.emps.phone,
	            email : $scope.emps.email,
	            profilePic : $scope.emps.profilePic
			  };

		$http.put('API/emp/' + $scope.id, data)
			.then(function(response) {
				$scope.emps = response.data;
			}, function errorCallback(response) {});
	};	

    this.upLoadImg = function(img, id, $scope) {
        var formData = new FormData();
        formData.append("file", img);
        var url = 'IMG/upload/' + id;

        var data = { profilePic : id };
		$http.put('API/emp/' + id, data)
			.then(function(response) {
				$scope.emps.profilePic = response.data;
			}, function errorCallback(response) {});

        $http.post(url, formData, {
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        });
    };

	this.test = function($scope) {
    	if ($scope.passw1 !== $scope.passw2) {
    		$scope.error = true;
    	} 
    	else {
    		$scope.error = false;
    	}
    	if ($scope.fName.length && $scope.lName.length && $scope.passw1.length && $scope.passw2.length) {
			$scope.incomplete = false;
    	}
  	};
});
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/mainpage/', {
                templateUrl: 'emp.html',
                controller: 'empCtrl'
            }).
            when('/edit/:id', {
                templateUrl: 'edit.html',
                controller: 'editCtrl'
            }).
            when('/create/', {
                templateUrl: 'create.html',
                controller: 'createCtrl'
            }).
            when('/dircReports/:id', {
                templateUrl: 'dircReports.html',
                controller: 'dircReportsCtrl'
            }).
            otherwise({
                redirectTo: '/mainpage/'
            });
    }]);

app.controller('empCtrl', ['$scope', 'myService', function($scope, myService) {

  $scope.reverse = false;
  $scope.busy = false;
  $scope.done = false;

  var temp;

  $scope.getNext = function() {
    myService.getNextEmp($scope);
  };

  $scope.getNext();

  $scope.getDirReports = function(id) {
    myService.getDirReports(id);
  };

  $scope.sortBy = function(ref) {
    $scope.sortReference = ref;
    $scope.reverse = ($scope.sortReference === temp) ? !$scope.reverse : false;
    temp = $scope.sortReference;
  };
}]);

app.controller('createCtrl', function($scope, myService) {

  $scope.createEmp = function(){
    myService.updateEmp($scope);
  };

  $scope.getAvailableManager = function(id) {
    myService.getAvailableManager(id, $scope);
  };

  $scope.upLoadImg = function(dataUrl, id) {
      var file = Upload.dataUrltoBlob(dataUrl, 'image');
      myService.upLoadImg(file, id);
  };
});

app.controller('editCtrl', function($scope, $routeParams, myService, Upload) {
  $scope.id = $routeParams.id;
  myService.getEmpById($scope);

  $scope.hasManager = false;

  $scope.editEmp = function () {
    myService.updateEmp($scope);
  }; 

  $scope.getAvailableManager = function(id) {
    myService.getAvailableManager(id, $scope);
  };

  $scope.deleteEmp = function(){
    myService.deleteEmp($scope.emps._id);
  };

  $scope.upLoadImg = function(dataUrl, id) {
      var file = Upload.dataUrltoBlob(dataUrl, 'image');
      myService.upLoadImg(file, id, $scope);
  };
});

app.controller('dircReportsCtrl', function($scope, $routeParams, myService) {
  $scope.id = $routeParams.id;
  $scope.reverse = false;
  $scope.busy = false;
  $scope.done = false;

  var temp;

  $scope.getDirReports = function() {
    myService.getDirReports($scope);
  };
  
  $scope.getDirReports();

  $scope.sortBy = function(ref) {
    $scope.sortReference = ref;
    $scope.reverse = ($scope.sortReference === temp) ? !$scope.reverse : false;
    temp = $scope.sortReference;
  };
});

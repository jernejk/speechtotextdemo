import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Locations } from '../../../speechReferenceData';
import { AccountService } from '../../../account.service';
import { AccountDetails } from '../../../account-details';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatVerticalStepper } from '@angular/material';
import { NavigationService } from 'src/app/navigation.service';


@Component({
  selector: 'app-storageaccount-detail',
  templateUrl: './storageaccount-detail.component.html',
  styleUrls: ['./storageaccount-detail.component.css']
})
export class StorageaccountDetailComponent implements OnInit {
  @Output() updated = new EventEmitter<AccountDetails>();
  accountDetails: AccountDetails;
  showAccountDetails: boolean;
  showAccountDetailsLabel: string = "Show Account Details";
  selectedIndex: number = 0


  //accountDetails:AccountDetails;
  locationOptions;
  constructor(private accountDetailsService: AccountService, private navService: NavigationService) {
    this.locationOptions = Locations;
    this.accountDetails = accountDetailsService.Details
    this.showAccountDetails = false;
    this.navService.MenuIcons = [{ "icon":"lock", "toolTip": this.showAccountDetailsLabel,"order":100, "click": (icon) => { this.toggleAccountDetails();icon.icon = (this.showAccountDetails) ?'minimize':'lock'; icon.toolTip = this.showAccountDetailsLabel } },
    { "toolTip": "Refresh", "icon": "refresh","click":(icon)=>{this.refresh()} }
  ];
    if (!this.accountDetailsService.IsSpeechValid.value || !this.accountDetailsService.IsStorageValid.value) {
      this.showAccountDetails = true;
    }
    this.setShowAccountDetailsLabel();
    this.accountDetailsService.IsStorageValid.subscribe((value) => {
      if (!value) {
        this.showAccountDetails = true;
        this.selectedIndex = 0;//storage details
      }
    });
    this.accountDetailsService.IsSpeechValid.subscribe((value) => {
      if (!value) {
        this.showAccountDetails = true;
        this.selectedIndex = 1;//speech details
      }
    });
  }



  ngOnInit() {
  }
  refresh() {
    //if the user is overriding credentials make sure we set both token values
    this.accountDetails.SASTokenReadOnly = this.accountDetails.SASToken
    this.accountDetailsService.save();
    this.updated.emit(this.accountDetails);

  }
  toggleAccountDetails() {
    this.showAccountDetails = !this.showAccountDetails
    this.setShowAccountDetailsLabel();
  }
  setShowAccountDetailsLabel() {
    if (this.showAccountDetails) {
      this.showAccountDetailsLabel = "Hide Account Details";
    } else {
      this.showAccountDetailsLabel = "Show Account Details";
    }
  }

}


import { Component, OnInit } from "@angular/core";
import { SignalRService } from "src/app/services/signal-r.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  messages: any[] = [];
  streamData: any;
  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.signalRService.init();
    this.signalRService.dataFlow.subscribe(data => {
      try {
        this.messages.push(data);
      } catch (e) {
        this.streamData = {};
      }
    });
  }

  onSend(message: string): void {
    this.signalRService.sendMessage(message).subscribe(
      () => {},
      err => {
        console.log(err);
      }
    );
  }
}

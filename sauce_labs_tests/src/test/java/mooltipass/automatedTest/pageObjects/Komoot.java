package mooltipass.automatedTest.pageObjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class Komoot extends AbstractPage{

	public Komoot(WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}

	
	@FindBy(xpath = "//span[text()='Anmelden']")
	private WebElement loginBtn;

	@FindBy(xpath = "//input[@type='email']")
	private WebElement email;

	@FindBy(xpath = "//input[@id='password']")
	private WebElement password;

	@FindBy(xpath = "//button[@type='submit']")
	private WebElement submitLogin;
	
	@FindBy(xpath = "//a[text()='Abmelden']")
	private WebElement logoutBtn;
	
	@FindBy(xpath = "//span//div[@class='c-thumbnail__img']")
	private WebElement user;
	
	public void goToLogin(){
		loginBtn.click();
	}
	
	public void enterEmail(String value){
		waitUntilAppears(email);
		email.sendKeys(value);
	}

	public void enterPassword(String value){
		waitUntilAppears(password);
		password.sendKeys(value);
	}
	
	public void submit(){
		submitLogin.click();
		}
	
	public boolean checkLogin(){

		waitUntilAppears(By.className("c-thumbnail__img"));
		return isElementPresent(By.className("c-thumbnail__img"));
	}


	public boolean checkAtLoginPage(){
		return isElementPresent(By.xpath("//input[@id='login_email']"));
	}
	
	public void logout(){
		waitUntilAppears(By.xpath("//a[contains(text(),'No, thanks.')]"));
		driver.findElement(By.xpath("//a[contains(text(),'No, thanks.')]")).click();
		Actions action = new Actions(driver);
		action.moveToElement(user).moveToElement(logoutBtn).click();
	//	action.moveToElement(logoutBtn);
		action.build().perform();
//		waitUntilAppears(logoutBtn);
//		logoutBtn.click();

	}
}
